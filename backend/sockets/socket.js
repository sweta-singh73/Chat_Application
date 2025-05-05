const jwt = require("jsonwebtoken");
const Message = require("../models/message");
const Chat = require("../models/chat");

const onlineUsers = {};

//============================== Socket Connection =================================//
const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.query.token;

      if (!token) {
        console.log("Connection rejected: No token provided");
        socket.emit("error", "No token provided");
        socket.disconnect();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded._id;

      if (!userId) {
        console.log("Connection rejected: Invalid token");
        socket.emit("error", "Invalid token");
        socket.disconnect();
        return;
      }

      socket.userId = userId;
      console.log(` User ${userId} connected on socket ${socket.id}`);

      //============================== Track Online Users =================================//
      if (!onlineUsers[userId]) {
        onlineUsers[userId] = [];
      }

      if (!onlineUsers[userId].includes(socket.id)) {
        onlineUsers[userId].push(socket.id);
      }

      broadcastOnlineUsers(io);

      //============================ Create Chat ====================================//

      socket.on("createChat", async (data) => {
        try {
          const { userIds, isGroup, groupName } = data;
          console.log("data", data);

          if (!userIds || userIds.length === 0) {
            return socket.emit("chatError", { message: "Members required" });
          }

          let chat;

          if (!isGroup && userIds.length === 1) {
            // 1-to-1 chat: check if it exists
            const existing = await Chat.findOne({
              isGroup: false,
              members: { $all: [socket.userId, userIds[0]], $size: 2 },
            });

            if (existing) {
              // Emit the existing chat to both users
              emitChatCreatedToUsers(existing);
              return;
            }

            // Create a new 1-to-1 chat
            chat = await Chat.create({
              members: [socket.userId, userIds[0]],
            });
            console.log("chat", chat);
          } else {
            // Group chat
            chat = await Chat.create({
              isGroup: true,
              members: [...userIds, socket.userId],
              groupName,
              groupAdmin: socket.userId,
            });
          }

          // Emit the newly created chat to all users in the chat
          emitChatCreatedToUsers(chat);
        } catch (error) {
          console.error("Error creating chat:", error);
          socket.emit("chatError", {
            message: "Failed to create chat",
            error: error.message,
          });
        }
      });

      // Function to emit the chat created event to all users in the chat
      function emitChatCreatedToUsers(chat) {
        chat.members.forEach((userId) => {
          const userSockets = onlineUsers[userId] || [];
          userSockets.forEach((socketId) => {
            io.to(socketId).emit("chatCreated", chat);
          });
        });
      }

      // ============================ Send Message =================================== //
      socket.on("sendMessage", async (data) => {
        try {
          const { chatId, content, messageType } = data;
          const sender = socket.userId;
      
          const message = await Message.create({
            chat: chatId,
            content,
            sender,
            messageType,
          });
      
          await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
      
          const chat = await Chat.findById(chatId).populate("members");
      
          chat.members.forEach((member) => {
            const socketId = onlineUsers[member._id.toString()];
            
            if (socketId) {
              io.to(socketId).emit("newMessage", message);
            }
          });
        } catch (err) {
          console.error("Send message error:", err);
          socket.emit("chatError", { message: "Failed to send message" });
        }
      });
      

      //============================== Handle Disconnection =================================//
      socket.on("disconnect", () => {
        const sockets = onlineUsers[userId] || [];
        onlineUsers[userId] = sockets.filter((id) => id !== socket.id);

        if (onlineUsers[userId].length === 0) {
          delete onlineUsers[userId];
        }

        console.log(` User ${userId} disconnected from socket ${socket.id}`);
        broadcastOnlineUsers(io);
      });
    } catch (error) {
      console.log(" Connection error:", error.message);
      socket.emit("error", "Authentication failed");
      socket.disconnect();
    }
  });
};

//============================== Helper Function =================================//
function broadcastOnlineUsers(io) {
  const onlineUserIds = Object.keys(onlineUsers);
  io.emit("updateOnlineUsers", onlineUserIds);
}

module.exports = socketHandler;

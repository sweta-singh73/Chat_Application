const Message = require("../models/message");
const {
  addUser,
  removeUserBySocket,
  getOnlineUsers,
} = require("../utils/onlineUsers");
const User = require("../models/user");

// const onlineUsers = {};

const socketHandler = (io) => {
  // io.on("connection", (socket) => {
  //   console.log("A user connected:", socket.id);
  //   const userId = socket.userId;

  //   if (!onlineUsers[userId]) {
  //     onlineUsers[userId] = [];
  //   }
  //   onlineUsers[userId].push(socket.id);

  //   const onlineUserList = Object.keys(onlineUsers).map((id) => ({
  //     _id: id,
  //   }));
  //   io.emit("online-users", onlineUserList);

  //   console.log(`${userId} connected. Online:`, onlineUserList);

  //   socket.on("send-message", async (data) => {
  //     const { from, to, content } = data;
  //     const message = new Message({
  //       from,
  //       to,
  //       content,
  //       timestamp: new Date(),
  //       status: onlineUsers[to] ? "delivered" : "pending",
  //     });

  //     try {
  //       await message.save();

  //       if (onlineUsers[to]) {
  //         onlineUsers[to].forEach((socketId) => {
  //           io.to(socketId).emit("receive-message", {
  //             sender: from,
  //             receiver: to,
  //             content,
  //           });
  //         });
  //       }

  //       console.log(`Message from ${from} to ${to} sent and saved.`);
  //     } catch (err) {
  //       console.error("Error saving message:", err);
  //     }
  //   });

  //   socket.on("disconnect", () => {
  //     if (userId && onlineUsers[userId]) {
  //       onlineUsers[userId] = onlineUsers[userId].filter(
  //         (id) => id !== socket.id
  //       );
  //       if (onlineUsers[userId].length === 0) {
  //         delete onlineUsers[userId];
  //         io.emit("user-disconnected", userId);
  //       }
  //     }

  //     const onlineUserList = Object.keys(onlineUsers).map((id) => ({
  //       _id: id,
  //     }));
  //     io.emit("online-users", onlineUserList);

  //     console.log(`Socket ${socket.id} disconnected`);
  //   });
  // });

  io.on("connection", async (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (!userId) {
      console.log("Connection rejected: no userId provided");
      socket.disconnect();
      return;
    }

    console.log("Connected:", userId);

    socket.userId = userId;

    addUser(userId.toString(), socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    socket.broadcast.emit("userOnline", { userId });

    socket.emit("onlineUsers", getOnlineUsers());

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("sendMessage", async ({ chatId, content, messageType }) => {
      try {
        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content,
          messageType,
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        io.to(chatId).emit("messageReceived", {
          sender: userId,
          content,
          messageType,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Error sending message:", err.message);
      }
    });

    // On disconnect
    socket.on("disconnect", async () => {
      const removedUserId = removeUserBySocket(socket.id);
      if (removedUserId) {
        await User.findByIdAndUpdate(removedUserId, { isOnline: false });
        socket.broadcast.emit("userOffline", { userId: removedUserId });
      }
    });
  });
};

module.exports = socketHandler;

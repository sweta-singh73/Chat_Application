const Message = require("../models/message");

const onlineUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("add-user", (userId) => {
      if (!onlineUsers[userId]) {
        onlineUsers[userId] = [];
      }
      onlineUsers[userId].push(socket.id);
      socket.userId = userId;

      const onlineUserList = Object.keys(onlineUsers).map((id) => ({
        _id: id,
      }));
      io.emit("online-users", onlineUserList);

      console.log(`${userId} connected. Online:`, onlineUserList);
    });

    socket.on("send-message", async (data) => {
      const { from, to, content } = data;
      const message = new Message({
        from,
        to,
        content,
        timestamp: new Date(),
        status: onlineUsers[to] ? "delivered" : "pending",
      });

      try {
        await message.save();

        if (onlineUsers[to]) {
          onlineUsers[to].forEach((socketId) => {
            io.to(socketId).emit("receive-message", {
              sender: from,
              receiver: to,
              content,
            });
          });
        }

        console.log(`Message from ${from} to ${to} sent and saved.`);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId && onlineUsers[userId]) {
        onlineUsers[userId] = onlineUsers[userId].filter(
          (id) => id !== socket.id
        );
        if (onlineUsers[userId].length === 0) {
          delete onlineUsers[userId];
          io.emit("user-disconnected", userId);
        }
      }

      const onlineUserList = Object.keys(onlineUsers).map((id) => ({
        _id: id,
      }));
      io.emit("online-users", onlineUserList);

      console.log(`Socket ${socket.id} disconnected`);
    });
  });
};

module.exports = socketHandler;

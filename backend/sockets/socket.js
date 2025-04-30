const mongoose = require("mongoose");
const Message = require("../models/message");

const onlineUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Add user to online list
    socket.on("add-user", (userId) => {
      if (!onlineUsers[userId]) {
        onlineUsers[userId] = new Set();
      }
      onlineUsers[userId].add(socket.id);
      socket.userId = userId;
      console.log(`${userId} is online`);
    });

    socket.on("send-message", async (data) => {
      const { to, from, content } = data;

      const messagePayload = {
        from,
        to,
        content,
        timestamp: new Date(),
        status: onlineUsers[to] ? "delivered" : "pending",
      };

      if (onlineUsers[to]) {
        for (const socketId of onlineUsers[to]) {
          io.to(socketId).emit("receive-message", { from, content });
        }
      }

      try {
        const message = new Message(messagePayload);
        await message.save();
        console.log(`Message from ${from} to ${to} saved.`);
      } catch (error) {
        console.error("Failed to save message:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const userId = socket.userId;

      if (userId && onlineUsers[userId]) {
        onlineUsers[userId].delete(socket.id);

        if (onlineUsers[userId].size === 0) {
          delete onlineUsers[userId];
          console.log(`${userId} is offline`);
          socket.broadcast.emit("user-disconnected", userId);
        }
      }
    });
  });
};

module.exports = socketHandler;

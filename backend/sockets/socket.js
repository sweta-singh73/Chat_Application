const jwt = require("jsonwebtoken");

const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.log("Connection rejected: No token provided");
        socket.emit("error", "No token provided");
        socket.disconnect();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.id;

      if (!userId) {
        console.log("Connection rejected: Invalid token");
        socket.emit("error", "Invalid token");
        socket.disconnect();
        return;
      }

      socket.userId = userId;
      console.log("User connected:", userId);
    } catch (error) {
      console.log("Connection error:", error.message);
      socket.emit("error", "Authentication failed");
      socket.disconnect();
    }
  });
};

module.exports = socketHandler;

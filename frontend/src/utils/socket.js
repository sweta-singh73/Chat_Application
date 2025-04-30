import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

export const connectSocket = (userId) => {
  socket.emit("add-user", userId); // Notify server user is online
};

export const sendMessage = (message) => {
  socket.emit("send-message", message); // Send message to server
};

export const receiveMessage = (callback) => {
  socket.on("receive-message", (message) => {
    callback(message);
  });
};

export const receiveOnlineUsers = (callback) => {
  socket.on("online-users", (users) => {
    callback(users);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.off(); // Clean up all listeners
  }
};

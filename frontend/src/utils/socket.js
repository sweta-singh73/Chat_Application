import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  socket = io("http://localhost:5000"); 
  socket.emit("add-user", userId);
};

export const sendMessage = (data) => {
  if (socket) {
    socket.emit("send-message", data);
  }
};

export const receiveMessage = (callback) => {
  if (socket) {
    socket.on("receive-message", callback);
  }
};

export const receiveOnlineUsers = (callback) => {
  if (socket) {
    socket.on("online-users", callback);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  // Get token from localStorage or sessionStorage
  const token = localStorage.getItem("token"); // Assuming the token is saved in localStorage

  if (!token) {
    console.log("No token found, unable to connect.");
    return; // You can also show a message or redirect to login if no token is found.
  }

  // Connect socket with the token
  socket = io("http://localhost:5000", {
    auth: {
      token: token, // Send token in handshake
    },
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("connect", () => {
    console.log("Connected to server with token authentication.");
  });

  socket.emit("add-user", socket.userId);
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

const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const messageRoutes = require("./routes/message.routes");
const chatRoutes = require("./routes/chat.routes");
const socketHandler = require("./sockets/socket");
const dbConnection = require("./config/db");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "chrome-extension://ophmdkgfcjapomjdpfobjfbihojchbko",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

dbConnection();

const io = socketIo(server, {
  cors: corsOptions, 
  transports: ["websocket", "polling"],
});

socketHandler(io);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

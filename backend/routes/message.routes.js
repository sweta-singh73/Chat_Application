const express = require("express");
const {
  sendMessage,
  getMessages,
} = require("../controllers/message.controller");
const upload = require("../middlewares/image.middleware");
const verifyToken = require("../middlewares/auth");
const router = express.Router();

router.post("/send", verifyToken, sendMessage);

router.get("/history", getMessages);

module.exports = router;

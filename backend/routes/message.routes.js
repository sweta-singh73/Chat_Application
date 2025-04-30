const express = require("express");
const {
  sendMessage,
  getMessages,
} = require("../controllers/message.controller");
const upload = require("../middlewares/image.middleware");
const router = express.Router();

router.post("/send", upload.any(), sendMessage);

         
router.get("/history", getMessages);  

module.exports = router; 
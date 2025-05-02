const express = require('express');
const  createChat = require('../controllers/chat.controller');
const verifyToken = require('../middlewares/auth');

const router = express.Router();


router.post("/create-chat", verifyToken, createChat);


module.exports = router;
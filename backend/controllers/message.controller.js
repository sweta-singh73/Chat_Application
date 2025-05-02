const Message = require("../models/message");
const Chat = require("../models/chat");

const sendMessage = async (req, res) => {
  const { chatId, messageType, content } = req.body;
  const sender = req.user._id;
  try {
    const message = await Message.create({
      chat: chatId,
      content,
      sender,
      messageType,
    });

    //update lastmessage
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId }).populate(
      "sender",
      "name"
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendMessage, getMessages };

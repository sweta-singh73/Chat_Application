const Message = require("../models/message");
const path = require("path");

// Send Message
const sendMessage = async (req, res) => {
  const { receiver, content } = req.body;

  try {
    const photoUrls = req.files
      ? req.files.map((file) => path.join("/uploads", file.filename))
      : [];

    const message = new Message({
      sender: req.user._id, // taken from token
      receiver,
      content,
      photos: photoUrls,
    });

    await message.save();
    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Message History
const getMessages = async (req, res) => {
  const { userId, otherUserId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendMessage, getMessages };

const Chat = require("../models/chat");

// Create 1-to-1 or Group chat
const createChat = async (req, res) => {
  const { userIds, isGroup, groupName } = req.body;
  const loggedInUser = req.user._id;

  if (!userIds || userIds.length === 0)
    return res.status(400).json({ message: "Members required" });

  // 1-to-1 chat
  if (!isGroup && userIds.length === 1) {
    let existing = await Chat.findOne({
      isGroup: false,
      members: { $all: [loggedInUser, userIds[0]], $size: 2 },
    });
    if (existing) return res.json(existing);

    const chat = await Chat.create({ members: [loggedInUser, userIds[0]] });
    return res.json(chat);
  }

  // Group chat
  const chat = await Chat.create({
    isGroup: true,
    members: [...userIds, loggedInUser],
    groupName,
    groupAdmin: loggedInUser,
  });
  res.json(chat);
};

module.exports =  createChat ;

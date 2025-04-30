let onlineUsers = {};

const addUser = (userId, socketId) => {
  onlineUsers[userId] = socketId;
};

const removeUser = (userId) => {
  delete onlineUsers[userId];
};

const getUser = (userId) => {
  return onlineUsers[userId];
};

module.exports = { addUser, removeUser, getUser };

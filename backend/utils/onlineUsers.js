const onlineUsers = new Map();
 
module.exports = {
  addUser(userId, socketId) {
    onlineUsers.set(userId, socketId);
  },
  removeUserBySocket(socketId) {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socketId) {
        onlineUsers.delete(userId);
        return userId;
      }
    }
  },
  getOnlineUsers() {
    return Array.from(onlineUsers.keys());
  },
  getSocketByUser(userId) {
    return onlineUsers.get(userId);
  }
};
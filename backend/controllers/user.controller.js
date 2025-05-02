const User = require("../models/user");

const searchUsers = async (req, res) => {
  const { search } = req.query;
  try {
    const users = await User.find({
      name: { $regex: search, $options: "i" },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { searchUsers };

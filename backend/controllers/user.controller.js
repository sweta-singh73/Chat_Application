const User = require("../models/user");

const loginUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email });
      await user.save();
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search Users
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

module.exports = { loginUser, searchUsers };

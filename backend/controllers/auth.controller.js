const User = require("../models/user");
const { generateToken } = require("../utils/generateToken");
const securePassword = require("../utils/hashPassword");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ error: "User already registered" });
    }

    const hashPassword = await securePassword(password);
    const userDetails = new User({
      name,
      phone,
      password: hashPassword,
    });

    const savedUser = await userDetails.save();
    // const userData = savedUser.toObject();
    // delete userData.password;
    res
      .status(200)
      .json({ message: "User registered successfully!", data: savedUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    console.log("Stored hashed password:", user.password);
    console.log("Received password:", password);

    const comparePass = await bcrypt.compare(password.trim(), user.password);

    console.log("comparePass result:", comparePass);

    if (!comparePass) {
      return res.status(400).json({ error: "Password does not match" });
    }

    const token = await generateToken(user._id);
    res.status(200).json({ message: "User login successfully", data: token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register, login };

const JWT = require("jsonwebtoken");

// ========================  Create Token ========================

const generateToken = async (id) => {
  try {
    let token = JWT.sign({ _id: id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "24h",
    });
    return token;
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = { generateToken };

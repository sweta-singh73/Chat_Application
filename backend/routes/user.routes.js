const express = require("express");
const { loginUser, searchUsers } = require("../controllers/user.controller");
const router = express.Router();

router.post("/login", loginUser);

router.get("/search", searchUsers);

module.exports = router;

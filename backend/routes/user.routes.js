const express = require("express");
const verifyToken = require("../middlewares/auth");
const { register, login } = require("../controllers/auth.controller");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);


router.get("/search", verifyToken);

module.exports = router;

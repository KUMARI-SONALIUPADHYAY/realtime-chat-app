const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {

  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword
  });

  await user.save();

  res.json({ message: "User registered" });

});

router.post("/login", async (req, res) => {

  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.status(400).json("User not found");

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) return res.status(400).json("Invalid password");

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.json({ token });

});

module.exports = router;
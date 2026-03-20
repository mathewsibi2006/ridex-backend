const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { first, last, email, phone, password } = req.body;

  // Simple validation
  if (!email || !password || !first || !last) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  // Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("Registration failed: User already exists", email);
    return res.status(400).json({ msg: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const role = email === "admin@gmail.com" ? "admin" : "user";

  const user = await User.create({
    firstName: first,
    lastName: last,
    email,
    phone,
    password: hashed,
    role
  });

  console.log("✅ User registered successfully:", user);
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ msg: "User not found" });

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.status(400).json({ msg: "Wrong password" });

  res.json(user);
});

router.patch("/profile/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, profilePicture } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ msg: "Server Error during profile update" });
  }
});

module.exports = router;

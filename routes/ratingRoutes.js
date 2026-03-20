const router = require("express").Router();
const Rating = require("../models/Rating");

router.post("/", async (req, res) => {
  const rating = await Rating.create(req.body);
  res.json(rating);
});

router.get("/", async (req, res) => {
  const ratings = await Rating.find();
  res.json(ratings);
});

router.get("/user/:userId", async (req, res) => {
  try {
    console.log("📂 [RatingRoute] Fetching ratings for userId:", req.params.userId);
    const ratings = await Rating.find({ userId: req.params.userId }).sort({ date: -1 });
    console.log(`✅ [RatingRoute] Found ${ratings.length} ratings`);
    res.json(ratings);
  } catch (err) {
    console.error("Fetch User Ratings Error:", err);
    res.status(500).json({ msg: "Server Error fetching ratings" });
  }
});

module.exports = router;

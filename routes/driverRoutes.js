const router = require("express").Router();
const Driver = require("../models/Driver");

router.post("/", async (req, res) => {
  const driver = await Driver.create(req.body);
  res.json(driver);
});

router.get("/", async (req, res) => {
  const drivers = await Driver.find();
  res.json(drivers);
});

router.put("/:id", async (req, res) => {
  await Driver.findByIdAndUpdate(req.params.id, req.body);
  res.json({ msg: "Updated" });
});

router.delete("/:id", async (req, res) => {
  await Driver.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;

const Category = require("../models/Category");

exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.list = async (req, res) => {
  const categories = await Category.find().sort("name");
  res.json({ success: true, categories });
};

exports.get = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ msg: "Category not found" });
  res.json({ success: true, category: cat });
};

exports.remove = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ msg: "Category not found" });

  await cat.deleteOne();
  res.json({ success: true, msg: "Category deleted" });
};

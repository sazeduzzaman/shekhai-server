const path = require("path");

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const folder = req.body.folder || "users";
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${folder}/${req.file.filename}`;

  res.json({
    success: true,
    message: "File uploaded successfully",
    fileUrl,
  });
};

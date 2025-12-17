exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  // Get folder from request body or default to 'users'
  const folder = req.body.folder || "users";

  // Construct accessible URL
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${folder}/${req.file.filename}`;

  res.json({
    success: true,
    message: "File uploaded successfully",
    fileUrl,
  });
};

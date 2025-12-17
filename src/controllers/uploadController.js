// uploadController.js - Update this
exports.uploadFile = (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });

  const folder = req.body.folder || "users";
  
  // Get protocol based on environment
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get("host");
  
  // Construct the URL
  const fileUrl = `${protocol}://${host}/uploads/${folder}/${req.file.filename}`;

  res.json({
    success: true,
    message: "File uploaded successfully",
    fileUrl, // This should be https://shekhai-server.up.railway.app/uploads/users/filename.jpg
  });
};
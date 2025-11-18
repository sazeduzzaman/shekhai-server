// This controller provides a signed upload URL stub for direct-to-S3 uploads.
const s3Service = require('../services/s3Service');

exports.getSignedUrl = async (req,res,next) => {
  const { filename, contentType } = req.body;
  if(!filename || !contentType) return res.status(400).json({ msg: 'filename and contentType required' });
  const { uploadUrl, publicUrl } = await s3Service.getSignedUploadUrl({ filename, contentType });
  res.json({ uploadUrl, publicUrl });
};

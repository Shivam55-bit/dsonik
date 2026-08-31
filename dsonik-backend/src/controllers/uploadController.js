const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    if (hasCloudinaryConfig) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'dsonik' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const result = await streamUpload(req.file.buffer);
      return res.json({
        success: true,
        url: result.secure_url,
        path: result.secure_url,
        public_id: result.public_id
      });
    }

    // Local Disk Fallback when Cloudinary is not configured
    const type = req.body.type || 'general';
    const uploadDirectory = path.resolve(__dirname, '../../uploads', type);
    fs.mkdirSync(uploadDirectory, { recursive: true });

    const extension = path.extname(req.file.originalname).toLowerCase();
    const safeBaseName = path.basename(req.file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const filename = `${safeBaseName || 'file'}-${Date.now()}${extension}`;
    const destinationPath = path.join(uploadDirectory, filename);

    if (req.file.buffer) {
      fs.writeFileSync(destinationPath, req.file.buffer);
    } else if (req.file.path && fs.existsSync(req.file.path)) {
      fs.copyFileSync(req.file.path, destinationPath);
    }

    const localUrl = `/uploads/${type}/${filename}`;
    return res.json({
      success: true,
      url: localUrl,
      path: localUrl,
      data: { url: localUrl, path: localUrl }
    });
  } catch (err) {
    next(err);
  }
};

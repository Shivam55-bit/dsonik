const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(
  __dirname,
  '../../uploads/banners'
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDirectory);
  },

  filename(req, file, callback) {
    const extension =
      path.extname(file.originalname).toLowerCase();

    const safeName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    callback(
      null,
      `${safeName || 'banner'}-${Date.now()}${extension}`
    );
  },
});

const allowedTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const fileFilter = (req, file, callback) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        'Only JPG, JPEG, PNG and WEBP banner images are allowed'
      )
    );
  }

  return callback(null, true);
};

const bannerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(
      process.env.MAX_FILE_SIZE || 10485760
    ),
  },
});

module.exports = bannerUpload;

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(
  __dirname,
  '../../uploads/categories'
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

    const safeBaseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const filename =
      `${safeBaseName || 'category'}-${Date.now()}${extension}`;

    callback(null, filename);
  },
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        'Only JPG, JPEG, PNG and WEBP images are allowed'
      )
    );
  }

  return callback(null, true);
};

const categoryUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(
      process.env.MAX_FILE_SIZE || 10485760
    ),
  },
});

module.exports = categoryUpload;

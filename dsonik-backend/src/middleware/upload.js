const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists recursively
const uploadDir = process.env.UPLOAD_DIR || './uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'products';
    if (req.baseUrl.includes('categories') || req.body.type === 'category') {
      subfolder = 'categories';
    } else if (req.body.type === 'banner') {
      subfolder = 'banners';
    }

    const targetPath = path.join(process.cwd(), uploadDir, subfolder);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only JPG, JPEG, PNG and WEBP are allowed.'), false);
  }
};

const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10485760);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize }
});

module.exports = upload;

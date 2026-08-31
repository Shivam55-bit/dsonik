const cloudinary = require('cloudinary').v2;

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET) &&
  !String(process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME).includes('your-') &&
  !String(process.env.CLOUDINARY_API_KEY).includes('your-') &&
  !String(process.env.CLOUDINARY_API_SECRET).includes('your-');

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

module.exports = {
  cloudinary,
  hasCloudinaryConfig
};

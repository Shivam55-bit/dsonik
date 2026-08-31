const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const upload = require('../../middleware/upload');
const ctrl = require('../../controllers/uploadController');

router.post('/', auth, admin, upload.single('file'), ctrl.uploadImage);

module.exports = router;

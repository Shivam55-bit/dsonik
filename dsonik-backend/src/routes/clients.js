const express = require('express');
const router = express.Router();
const { getPublicClients } = require('../controllers/clientController');

router.get('/', getPublicClients);

module.exports = router;

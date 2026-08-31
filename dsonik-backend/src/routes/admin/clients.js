const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const { clientUpload } = require('../../middleware/cmsUpload');
const {
  getAdminClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('../../controllers/clientController');

router.get('/', protect, authorize('admin', 'superadmin'), getAdminClients);
router.get('/:id', protect, authorize('admin', 'superadmin'), getClientById);

router.post(
  '/',
  protect,
  authorize('admin', 'superadmin'),
  clientUpload.single('logo'),
  createClient
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'superadmin'),
  clientUpload.single('logo'),
  updateClient
);

router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteClient);

module.exports = router;

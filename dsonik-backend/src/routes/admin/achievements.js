const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/admin');
const {
  getAdminAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement
} = require('../../controllers/achievementController');

router.get('/', protect, authorize('admin', 'superadmin'), getAdminAchievements);
router.get('/:id', protect, authorize('admin', 'superadmin'), getAchievementById);
router.post('/', protect, authorize('admin', 'superadmin'), createAchievement);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateAchievement);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteAchievement);

module.exports = router;

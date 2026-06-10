
const express = require('express');
const router = express.Router();
const {
  getAllRoadmaps,
  getRoadmap,
  getPersonalizedRoadmaps,
  enrollInRoadmap,
  getUserProgress,
  markStepComplete,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.get('/', getAllRoadmaps);
router.get('/personalized', protect, getPersonalizedRoadmaps);
router.get('/:id', getRoadmap);
router.post('/:id/enroll', protect, enrollInRoadmap);
router.get('/progress', protect, getUserProgress);
router.put('/progress/:progressId/complete', protect, markStepComplete);

module.exports = router;

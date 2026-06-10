
const Roadmap = require('../models/Roadmap');
const UserProgress = require('../models/UserProgress');

// @desc Get all roadmaps
// @route GET /api/roadmaps
// @access Public
exports.getAllRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find();
    res.status(200).json({ success: true, data: roadmaps });
  } catch (error) {
    next(error);
  }
};

// @desc Get single roadmap
// @route GET /api/roadmaps/:id
// @access Public
exports.getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    res.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    next(error);
  }
};

// @desc Get personalized roadmaps for user
// @route GET /api/roadmaps/personalized
// @access Private
exports.getPersonalizedRoadmaps = async (req, res, next) => {
  try {
    const user = req.user;
    const interests = user.interests || [];
    let query = {};

    if (interests.length > 0) {
      query = {
        $or: [
          { category: { $in: interests.map(i => i) } },
          { tags: { $in: interests.map(i => i) } },
        ],
      };
    }

    const roadmaps = await Roadmap.find(query);
    res.status(200).json({ success: true, data: roadmaps });
  } catch (error) {
    next(error);
  }
};

// @desc Enroll user in a roadmap
// @route POST /api/roadmaps/:id/enroll
// @access Private
exports.enrollInRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const existingProgress = await UserProgress.findOne({
      user: req.user._id,
      roadmap: req.params.id,
    });

    if (existingProgress) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this roadmap' });
    }

    const userProgress = await UserProgress.create({
      user: req.user._id,
      roadmap: req.params.id,
      currentStep: 1,
      lastActive: new Date(),
    });

    res.status(201).json({ success: true, data: userProgress });
  } catch (error) {
    next(error);
  }
};

// @desc Get user progress for all roadmaps
// @route GET /api/roadmaps/progress
// @access Private
exports.getUserProgress = async (req, res, next) => {
  try {
    const userProgress = await UserProgress.find({ user: req.user._id }).populate('roadmap');
    res.status(200).json({ success: true, data: userProgress });
  } catch (error) {
    next(error);
  }
};

// @desc Mark step as complete
// @route PUT /api/roadmaps/progress/:progressId/complete
// @access Private
exports.markStepComplete = async (req, res, next) => {
  try {
    const { stepId } = req.body;
    const progress = await UserProgress.findById(req.params.progressId).populate('roadmap');

    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }

    // Check if step already completed
    if (progress.completedSteps.some(s => s.stepId.toString() === stepId)) {
      return res.status(400).json({ success: false, message: 'Step already completed' });
    }

    // Find the step in the roadmap to get XP
    const roadmap = progress.roadmap;
    const step = roadmap.steps.id(stepId);
    if (!step) {
      return res.status(404).json({ success: false, message: 'Step not found in roadmap' });
    }

    // Add completed step
    progress.completedSteps.push({
      stepId,
      completedAt: new Date(),
    });

    // Update XP
    progress.xpEarned += step.xpPoints;

    // Update current step to next one
    const nextStep = step.unlockOrder + 1;
    if (nextStep <= roadmap.steps.length) {
      progress.currentStep = nextStep;
    }

    // Update streak
    const today = new Date();
    const lastActive = progress.lastActive || new Date(0);
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      progress.streak += 1;
    } else if (daysDiff > 1) {
      progress.streak = 1;
    }
    progress.lastActive = today;

    // Check for badges
    const completionPercent = (progress.completedSteps.length / roadmap.steps.length) * 100;
    if (completionPercent >= 25 && !progress.badges.some(b => b.name === 'First Steps')) {
      progress.badges.push({
        name: 'First Steps',
        description: 'Completed your first 25% of a roadmap!',
        icon: 'fa-shoe-prints',
        earnedAt: new Date(),
      });
    }
    if (completionPercent >= 50 && !progress.badges.some(b => b.name === 'Halfway There')) {
      progress.badges.push({
        name: 'Halfway There',
        description: 'Completed 50% of a roadmap!',
        icon: 'fa-flag-checkered',
        earnedAt: new Date(),
      });
    }
    if (completionPercent >= 100 && !progress.badges.some(b => b.name === 'Roadmap Master')) {
      progress.badges.push({
        name: 'Roadmap Master',
        description: 'Completed an entire roadmap!',
        icon: 'fa-trophy',
        earnedAt: new Date(),
      });
    }
    if (progress.streak >= 7 && !progress.badges.some(b => b.name === '7-Day Streak')) {
      progress.badges.push({
        name: '7-Day Streak',
        description: 'Completed steps for 7 days in a row!',
        icon: 'fa-fire',
        earnedAt: new Date(),
      });
    }

    await progress.save();

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

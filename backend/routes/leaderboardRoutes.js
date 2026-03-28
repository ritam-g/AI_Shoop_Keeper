const express = require('express');
const router = express.Router();
const { saveScore, getLeaderboard } = require('../controllers/leaderboardController');

// POST /api/leaderboard/save-score
router.post('/save-score', saveScore);

// GET /api/leaderboard
router.get('/', getLeaderboard);

module.exports = router;

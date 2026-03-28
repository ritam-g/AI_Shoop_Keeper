const express = require('express');
const router = express.Router();
const { startSession, negotiate } = require('../controllers/sessionController');

// POST /api/sessions/start-session
router.post('/start-session', startSession);

// POST /api/sessions/negotiate
router.post('/negotiate', negotiate);

module.exports = router;

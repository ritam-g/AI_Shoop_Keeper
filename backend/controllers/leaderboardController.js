const Leaderboard = require('../models/Leaderboard');
const Session = require('../models/Session');

// Save score
const saveScore = async (req, res) => {
    try {
        const { username, sessionId } = req.body;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Only save if session is valid
        if (session.status === 'INVALID' || !session.isDealClosed) {
            return res.status(400).json({ success: false, error: 'Invalid or unclosed session. No score saved.' });
        }

        // score = basePrice - finalPrice
        const score = Math.max(0, session.basePrice - session.finalPrice);

        const newEntry = new Leaderboard({
            username,
            finalPrice: session.finalPrice,
            score,
            rounds: session.currentRound
        });

        await newEntry.save();

        res.json({ success: true, score });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find()
            .sort({ score: -1 })
            .limit(10);

        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { saveScore, getLeaderboard };

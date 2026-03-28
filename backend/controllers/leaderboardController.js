const Leaderboard = require('../models/Leaderboard');

// Save score
const saveScore = async (req, res) => {
    try {
        const { username, finalPrice, rounds } = req.body;

        const score = Math.max(0, 1000 - finalPrice); // Lower price = higher score

        const newEntry = new Leaderboard({
            username,
            finalPrice,
            score,
            rounds
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

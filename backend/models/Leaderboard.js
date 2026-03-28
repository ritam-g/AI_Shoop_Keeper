const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    finalPrice: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    rounds: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Index for sorting by score/price
leaderboardSchema.index({ score: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    minPrice: {
        type: Number,
        required: true
    },
    targetPrice: {
        type: Number,
        required: true
    },
    currentRound: {
        type: Number,
        default: 0
    },
    maxRounds: {
        type: Number,
        default: 7
    },
    isDealClosed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['WIN', 'LOSS', 'INVALID', 'PENDING'],
        default: 'PENDING'
    },
    aiInteractionCount: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        default: null
    },
    chatHistory: [{
        userOffer: Number,
        counterPrice: Number,
        aiResponse: String,
        round: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);

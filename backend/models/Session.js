const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        default: 'Premium Wireless Headphones'
    },
    basePrice: {
        type: Number,
        required: true,
        default: 1000
    },
    minPrice: {
        type: Number,
        required: true,
        default: 600
    },
    targetPrice: {
        type: Number,
        required: true,
        default: 850
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

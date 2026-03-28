const Session = require('../models/Session');
const { calculateNextPrice } = require('../utils/negotiationLogic');
const { generateResponse } = require('../services/geminiService');

// Start new session
const startSession = async (req, res) => {
    try {
        const session = new Session({
            productName: 'Premium Wireless Headphones'
        });
        await session.save();
        res.json({
            success: true,
            sessionId: session._id,
            productName: session.productName,
            basePrice: session.basePrice,
            message: 'Negotiation session started! Make your first offer.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Negotiate
const negotiate = async (req, res) => {
    try {
        const { sessionId, userOffer } = req.body;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (session.isDealClosed) {
            return res.json({ success: false, error: 'Session already closed' });
        }

        session.currentRound += 1;

        // Calculate next price
        const negotiationResult = calculateNextPrice(session, parseFloat(userOffer));

        let responseText;
        if (negotiationResult.accept) {
            session.isDealClosed = true;
            session.finalPrice = negotiationResult.counterPrice;
            responseText = await generateResponse(userOffer, negotiationResult.counterPrice, 'happy seller', session.productName);
            await session.save();
        } else if (session.currentRound >= session.maxRounds) {
            session.isDealClosed = true;
            session.finalPrice = session.basePrice; // No deal, high price
            responseText = 'Negotiation rounds exhausted. No deal made.';
            await session.save();
        } else {
            // Add to history and generate AI response
            session.chatHistory.push({
                userOffer: parseFloat(userOffer),
                counterPrice: negotiationResult.counterPrice,
                aiResponse: '',
                round: session.currentRound
            });

            responseText = await generateResponse(userOffer, negotiationResult.counterPrice, 'confident seller', session.productName);
            session.chatHistory[session.chatHistory.length - 1].aiResponse = responseText;

            await session.save();
        }

        res.json({
            success: true,
            accept: negotiationResult.accept,
            counterPrice: negotiationResult.counterPrice,
            currentRound: session.currentRound,
            maxRounds: session.maxRounds,
            aiResponse: responseText,
            isDealClosed: session.isDealClosed,
            finalPrice: session.finalPrice
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { startSession, negotiate };

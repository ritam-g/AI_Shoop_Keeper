const Session = require('../models/Session');
const { calculateNextPrice } = require('../utils/negotiationLogic');
const { generateResponse } = require('../services/geminiService');
const products = require('../config/products');

// Start new session
const startSession = async (req, res) => {
    try {
        const { productName } = req.body;
        
        if (!productName) {
            return res.status(400).json({ success: false, error: 'Product name is required' });
        }

        const product = products.find(p => p.name === productName);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const session = new Session({
            productName: product.name,
            productImage: product.image,
            basePrice: product.basePrice,
            minPrice: product.minPrice,
            targetPrice: product.targetPrice
        });

        await session.save();
        res.json({
            success: true,
            sessionId: session._id,
            productName: session.productName,
            productImage: session.productImage,
            basePrice: session.basePrice,
            message: `Negotiation for ${session.productName} started! Make your first offer.`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all products
const getProducts = (req, res) => {
    res.json({ success: true, products });
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
        let isWon = false;

        if (negotiationResult.accept) {
            session.isDealClosed = true;
            isWon = true;
            session.finalPrice = negotiationResult.counterPrice;
            responseText = await generateResponse(userOffer, negotiationResult.counterPrice, 'happy seller', session.productName, session.minPrice);
            await session.save();
        } else if (session.currentRound >= session.maxRounds) {
            session.isDealClosed = true;
            isWon = false;
            session.finalPrice = session.basePrice; // High price = no deal
            responseText = "Listen, I gave it my best shot but we're just too far apart. No deal today. Maybe next time!";
            await session.save();
        } else {
            // Add to history and generate AI response
            session.chatHistory.push({
                userOffer: parseFloat(userOffer),
                counterPrice: negotiationResult.counterPrice,
                aiResponse: '',
                round: session.currentRound
            });

            responseText = await generateResponse(userOffer, negotiationResult.counterPrice, 'confident seller', session.productName, session.minPrice);
            session.chatHistory[session.chatHistory.length - 1].aiResponse = responseText;

            await session.save();
        }

        res.json({
            success: true,
            accept: negotiationResult.accept,
            isWon,
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

module.exports = { startSession, negotiate, getProducts };

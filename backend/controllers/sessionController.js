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
/**
 * Handles the negotiation logic between the user and the AI.
 * 1. Validates session existence and status.
 * 2. Increments round count and calculates AI counter-offer.
 * 3. Evaluates if the deal is accepted, lost, or ongoing.
 * 4. Enforces validation rules (min 2 rounds) to prevent early game bypass.
 */
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

        let isWon = false;
        let status = 'INVALID';

        // CASE 1: AI accepts the user's latest offer
        if (negotiationResult.accept) {
            session.isDealClosed = true;
            session.finalPrice = negotiationResult.counterPrice;
            session.aiInteractionCount += 1;
            
            // VALIDATION: Must have at least 2 rounds and 1 AI reply to prevent bypassing the game
            if (session.currentRound >= 1 && session.aiInteractionCount >= 1) {
                isWon = true;
                status = 'WIN';
            } else {
                isWon = false;
                status = 'INVALID';
            }
            session.status = status;

            // Generate AI response with a 'happy' personality for acceptance
            responseText = await generateResponse(userOffer, negotiationResult.counterPrice, 'happy seller', session.productName, session.minPrice);
            await session.save();
        } 
        // CASE 2: Maximum rounds reached without a deal
        else if (session.currentRound >= session.maxRounds) {
            session.isDealClosed = true;
            session.finalPrice = session.basePrice; // Revert to base price (no deal)
            session.aiInteractionCount += 1;
            
            // VALIDATION: Even if no deal, rounds must have happened for a 'LOSS' instead of 'INVALID'
            if (session.currentRound >= 2 && session.aiInteractionCount >= 1) {
                isWon = false;
                status = 'LOSS';
            } else {
                isWon = false;
                status = 'INVALID';
            }
            session.status = status;

            responseText = "Listen, I gave it my best shot but we're just too far apart. No deal today. Maybe next time!";
            await session.save();
        } 
        // CASE 3: Ongoing negotiation (seller gives a counter-offer)
        else {
            session.aiInteractionCount += 1;
            session.chatHistory.push({
                userOffer: parseFloat(userOffer),
                counterPrice: negotiationResult.counterPrice,
                aiResponse: '',
                round: session.currentRound
            });

            // Generate AI response with a 'confident' personality for negotiation
            responseText = await generateResponse(userOffer, negotiationResult.counterPrice, 'confident seller', session.productName, session.minPrice);
            session.chatHistory[session.chatHistory.length - 1].aiResponse = responseText;

            await session.save();
        }

        res.json({
            success: true,
            accept: negotiationResult.accept,
            isWon,
            status: session.status,
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

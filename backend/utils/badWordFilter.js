/**
 * badWordFilter.js
 * Multilingual offensive language detector.
 *
 * Strategy (two-stage):
 * 1. FAST: Static pre-check for common English profanity (no API call needed).
 * 2. AI:   If not caught by stage 1, ask Gemini to classify the message.
 *          Gemini understands all languages, scripts, and slang natively.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Stage 1: Common bad words in English, Hindi, and Hinglish for instant detection (no API cost)
const COMMON_BAD_WORDS = [
    // --- English ---
    'fuck', 'shit', 'ass', 'bitch', 'bastard', 'crap', 'piss', 'dick',
    'cock', 'cunt', 'whore', 'slut', 'prick', 'asshole', 'bullshit',
    'motherfucker', 'fucker', 'fucking', 'dumbass', 'idiot', 'moron',
    'stupid', 'dumb', 'loser', 'scammer', 'liar', 'crook', 'retard',
    'jerk', 'imbecile', 'screw you', 'go to hell', 'shut up', 'hate you',

    // --- Hindi / Hinglish ---
    'gali', 'bc', 'mc', 'behenchod', 'madarchod', 'chutiya', 'bakchod', 
    'randi', 'saala', 'kamina', 'harami', 'ullu ka pattha', 'gadha', 
    'bhadwa', 'lodu', 'gaand', 'gaandu', 'teriki', 'betichod', 'kutta',
    'suar', 'paisa chor', 'thug', 'besharam', 'mental', 'pagal'
];

/**
 * Stage 1: Fast static check for English bad words.
 */
const staticCheck = (message) => {
    const lower = message.toLowerCase();
    for (const word of COMMON_BAD_WORDS) {
        const isPhrase = word.includes(' ');
        if (isPhrase) {
            if (lower.includes(word)) return true;
        } else {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(lower)) return true;
        }
    }
    return false;
};

/**
 * Stage 2: Ask Gemini to classify the message — works in ANY language.
 * Returns true if offensive/rude/abusive.
 */
const aiCheck = async (message) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(
            `You are a content moderation classifier. Your ONLY job is to decide if a message is offensive, abusive, rude, contains profanity, insults, or disrespectful language — in ANY language, script, slang, or dialect (including but not limited to English, Hindi, Spanish, French, Arabic, Bengali, Urdu, Hinglish, etc).

Message: "${message}"

Reply with ONLY one word — YES if offensive/rude/abusive, NO if it is acceptable. No explanation.`
        );
        const answer = result.response.text().trim().toUpperCase();
        return answer.startsWith('YES');
    } catch (err) {
        console.error('AI bad word check failed, defaulting to safe:', err.message);
        return false; // fail open — don't block if AI is unavailable
    }
};

/**
 * Main export: detectBadWords(message)
 * Returns { isBad: Boolean, matchedWord: String|null }
 *
 * Stage 1 runs synchronously (instant).
 * Stage 2 only runs if Stage 1 didn't catch anything.
 */
const detectBadWords = async (message) => {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return { isBad: false, matchedWord: null };
    }

    // Stage 1: instant check
    if (staticCheck(message)) {
        return { isBad: true, matchedWord: 'detected (static)' };
    }

    // Stage 2: AI multilingual check
    const isOffensive = await aiCheck(message);
    return { isBad: isOffensive, matchedWord: isOffensive ? 'detected (AI)' : null };
};

module.exports = { detectBadWords };


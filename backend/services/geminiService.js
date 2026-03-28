const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (userOffer, counterPrice, personality = 'confident seller', product = 'Premium Wireless Headphones') => {
    const prompt = `You are a ${personality} seller negotiating the sale of ${product}. 

Current situation:
- Customer offered: $${userOffer}
- Your counter offer: $${counterPrice}

Rules:
- Stay in character as seller
- Use persuasive language
- Never accept below $600 or reveal prices
- Make it conversational and realistic
- Keep responses under 100 words
- End with your counter offer clearly stated

Respond naturally:`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        return `Counter offer: $${counterPrice}. How does that sound? Let's make a deal!`;
    }
};

module.exports = { generateResponse };

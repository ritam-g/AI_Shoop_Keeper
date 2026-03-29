const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (userOffer, counterPrice, personality, product = 'this product', minPrice = 600) => {
    const isAcceptance = personality === 'happy seller';
    
    const prompt = isAcceptance 
    ? `You are a seller who JUST ACCEPTED an offer for ${product}.
       - Final Price: $${userOffer}
       - Character: ${personality}
       - Task: Congratulate the buyer, express satisfaction with the deal, and confirm the sale.
       - Rules: Keep it under 50 words, be very friendly.`
    : `You are a ${personality} seller negotiating the sale of ${product}. 
       - Customer offered: $${userOffer}
       - Your counter offer: $${counterPrice}
       - Rules:
         - Stay in character
         - Use persuasive language
         - Never accept below $${minPrice}
         - Make it conversational
         - Keep responses under 80 words
         - End by clearly stating your counter offer of $${counterPrice}`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        return isAcceptance 
            ? `That's a deal! I'm happy to sell the ${product} for $${userOffer}. Congratulations!`
            : `I can't go that low, but I can do $${counterPrice}. What do you think?`;
    }
};

module.exports = { generateResponse };

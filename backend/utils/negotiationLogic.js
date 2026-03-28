const calculateNextPrice = (session, userOffer) => {
    const { minPrice, targetPrice, currentRound, maxRounds, chatHistory } = session;

    if (userOffer < minPrice) {
        return {
            accept: false,
            counterPrice: null,
            message: 'reject_low',
            reason: 'below minimum price'
        };
    }

    if (userOffer >= targetPrice) {
        return {
            accept: true,
            counterPrice: userOffer,
            message: 'accept',
            reason: 'above target'
        };
    }

    // Generate counter offer - get closer to target as rounds progress
    const progressFactor = currentRound / maxRounds;
    const concession = (targetPrice - minPrice) * 0.1 * (1 - progressFactor); // Decrease concession over rounds
    const counterPrice = Math.max(minPrice, targetPrice - concession);

    // Ensure counter is reasonable (higher than user offer for seller logic)
    const finalCounter = Math.max(counterPrice, userOffer + 20);

    return {
        accept: false,
        counterPrice: Math.round(finalCounter),
        message: 'counter',
        reason: 'negotiate'
    };
};

module.exports = { calculateNextPrice };

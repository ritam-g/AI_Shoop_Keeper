const calculateNextPrice = (session, userOffer) => {
    const { minPrice, targetPrice, currentRound, maxRounds } = session;

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
    const concession = (targetPrice - minPrice) * 0.15 * (1 - progressFactor); // Concede less as rounds go by
    let counterPrice = Math.max(minPrice, targetPrice - concession);

    // If offer is very low, stay firm or slightly lower target Price
    if (userOffer < minPrice) {
        counterPrice = Math.max(minPrice, targetPrice * (1 - progressFactor * 0.1));
    } else {
        // Ensure counter is reasonable (at least slightly higher than user offer for seller logic)
        counterPrice = Math.max(counterPrice, userOffer + 10);
    }

    // Final guard rails
    counterPrice = Math.max(minPrice, Math.round(counterPrice));

    return {
        accept: false,
        counterPrice: counterPrice,
        message: 'counter',
        reason: 'negotiate'
    };
};

module.exports = { calculateNextPrice };

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get('/api/leaderboard');
            setLeaderboard(response.data.leaderboard);
        } catch (error) {
            console.error('Leaderboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading leaderboard...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🏆 Top Negotiators</h2>
            <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                    <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-primary">
                                #{index + 1}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{entry.username}</p>
                                <p className="text-sm text-gray-500">{entry.rounds} rounds</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">${entry.finalPrice.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Score: {entry.score}</p>
                        </div>
                    </div>
                ))}
            </div>
            {leaderboard.length === 0 && (
                <p className="text-center text-gray-500 py-8">No scores yet. Be the first!</p>
            )}
        </div>
    );
};

export default Leaderboard;

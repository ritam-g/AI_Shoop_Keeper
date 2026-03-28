import React, { useState } from 'react';
import axios from 'axios';
import GameChat from './components/GameChat';
import Leaderboard from './components/Leaderboard';

function App() {
    const [gameActive, setGameActive] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);

    const startGame = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/sessions/start-session');
            setSessionId(response.data.sessionId);
            setGameActive(true);
        } catch (error) {
            alert('Backend not running. Starting mock session.');
            setSessionId('mock');
            setGameActive(true);
        } finally {
            setLoading(false);
        }
    };

    const backToStart = () => {
        setGameActive(false);
        setSessionId(null);
    };

    if (gameActive) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={backToStart}
                            className="text-primary hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                            ← New Game
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">AI Negotiation</h1>
                        <div />
                    </div>
                    <GameChat
                        sessionId={sessionId}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    🤝 AI Negotiation Game
                </h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Play Game</h3>
                        <p className="text-gray-600 mb-6">Negotiate with AI seller to get the best deal!</p>
                        <button
                            onClick={startGame}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Starting...' : '🎮 Start Negotiation'}
                        </button>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h3>
                        <Leaderboard />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;

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
            const response = await axios.post('/api/sessions/start-session');
            setSessionId(response.data.sessionId);
            setGameActive(true);
        } catch (error) {
            console.error('API Error:', error);
            alert('Make sure your backend server is running and connected!');
        } finally {
            setLoading(false);
        }
    };

    if (gameActive) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 font-sans text-[#1e293b]">
                <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-700">
                    <header className="flex justify-between items-center w-full">
                        <button
                            onClick={() => setGameActive(false)}
                            className="bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-medium flex items-center gap-2 group text-sm"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Home
                        </button>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            NEGOTIATION ROOM
                        </h2>
                        <div className="w-[70px]" />
                    </header>
                    
                    <GameChat sessionId={sessionId} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1e293b]">
            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <main className="grid lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-7 space-y-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Negotiation Engine
                        </div>
                        
                        <div className="space-y-4">
                            <h1 className="text-6xl font-black tracking-tight leading-[1.1]">
                                Outsmart the <br/>
                                <span className="text-primary italic">AI Seller.</span>
                            </h1>
                            <p className="text-xl text-slate-500 max-w-md leading-relaxed">
                                Step into the negotiation room. Can you convince our AI to give you the deal of a lifetime?
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={startGame}
                                disabled={loading}
                                className="px-8 py-5 bg-primary text-white rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all hover:scale-[1.02] shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Initializing...' : 'Start Negotiating'} 
                                <span className="text-2xl">⚡</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                            <div>
                                <p className="text-2xl font-bold">100%</p>
                                <p className="text-slate-500 text-sm">AI Driven</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">Real-time</p>
                                <p className="text-slate-500 text-sm">Dynamic Engine</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">7 Rounds</p>
                                <p className="text-slate-500 text-sm">To make the deal</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 w-full">
                        <Leaderboard />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;

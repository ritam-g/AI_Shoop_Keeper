import React, { useState } from 'react';
import axios from 'axios';
import GameChat from './components/GameChat';
import Leaderboard from './components/Leaderboard';
import ProductSelection from './components/ProductSelection';

function App() {
    const [gameActive, setGameActive] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const startGame = async (productName) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/sessions/start-session', { productName });
            setSessionId(response.data.sessionId);
            setProduct({
                name: response.data.productName,
                image: response.data.productImage,
                basePrice: response.data.basePrice
            });
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
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back Home
                        </button>
                        <h2 className="text-xl font-black gradient-text-primary tracking-tight">
                            NEGOTIATION ROOM
                        </h2>
                        <div className="w-[70px]" />
                    </header>
                    
                    <GameChat sessionId={sessionId} product={product} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1e293b]">
            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <main className="grid lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-12 space-y-12 mb-10 text-center flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 rounded-full text-xs font-bold uppercase tracking-widest text-[#3b82f6]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="gradient-text-cyan">Live AI Marketplace</span>
                        </div>
                        
                        <div className="space-y-4 max-w-4xl">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                                <span className="gradient-text-secondary">Pick a Product.</span> Outsmart the <br/>
                                <span className="gradient-text-primary italic">AI Seller.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed mx-auto font-medium">
                                Select a product you're interested in and step into the negotiation room. 
                                Can you convince our AI to give you the deal of a lifetime?
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            Available Inventory
                            <span className="h-px bg-slate-200 flex-grow" />
                        </h2>
                        <ProductSelection onSelect={startGame} loading={loading} />
                    </div>

                    <div className="lg:col-span-4 w-full">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            Top Negotiators
                            <span className="h-px bg-slate-200 flex-grow" />
                        </h2>
                        <Leaderboard />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;

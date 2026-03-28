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
            setLeaderboard(response.data.leaderboard || []);
        } catch (error) {
            console.error('Leaderboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Ranks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100 animate-in slide-in-from-right-8 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Leaderboard</h2>
                    <p className="text-sm text-slate-500 font-medium">Top negotiators of the week</p>
                </div>
                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    🏆
                </div>
            </div>

            <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                    <div 
                        key={entry._id} 
                        className="group flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 transition-all border border-transparent hover:border-slate-100"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg ${
                                index === 0 ? 'bg-amber-100 text-amber-600' : 
                                index === 1 ? 'bg-slate-200 text-slate-500' :
                                index === 2 ? 'bg-orange-100 text-orange-600' : 
                                'bg-white text-slate-400 shadow-sm'
                            }`}>
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{entry.username}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{entry.rounds} ROUNDS</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-slate-900">$ {entry.finalPrice?.toLocaleString()}</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SCORE: {entry.score}</p>
                        </div>
                    </div>
                ))}
            </div>

            {leaderboard.length === 0 && (
                <div className="text-center py-16 space-y-4">
                    <div className="text-4xl opacity-20">🧊</div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found yet</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;

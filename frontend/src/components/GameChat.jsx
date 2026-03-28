import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GameChat = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [userOffer, setUserOffer] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState('ongoing'); // 'ongoing', 'ended'
  const [isWon, setIsWon] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(7);
  const [finalPrice, setFinalPrice] = useState(null);
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userOffer || loading || gameStatus !== 'ongoing') return;

    const offerNum = parseFloat(userOffer);
    if (isNaN(offerNum) || offerNum <= 0) return;

    setLoading(true);
    const userMessage = { 
      type: 'user', 
      text: `I'm offering you $${offerNum.toLocaleString()}.`, 
      offer: offerNum 
    };
    setMessages(prev => [...prev, userMessage]);
    setUserOffer('');

    try {
      const response = await axios.post('/api/sessions/negotiate', {
        sessionId,
        userOffer: offerNum
      });

      const { aiResponse, counterPrice, accept, isWon: won, currentRound: round, maxRounds: max, isDealClosed, finalPrice: final } = response.data;

      const aiMessage = {
        type: 'ai',
        text: aiResponse,
        counterPrice: counterPrice,
        accept: accept,
        round: round
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setCurrentRound(round);
        setMaxRounds(max);

        if (isDealClosed) {
          setFinalPrice(final);
          setIsWon(won);
          setGameStatus('ended');
        }
        setLoading(false);
      }, 600); // Small delay for "AI thinking" feel

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { type: 'system', text: 'Connection lost. Please try again.' }]);
      setLoading(false);
    }
  };

  if (gameStatus === 'ended') {
    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-500">
        <div className={`p-10 text-center ${isWon ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm text-4xl">
            {isWon ? '🎉' : '🤝'}
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {isWon ? 'Deal Accepted!' : 'Negotiation Ended'}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            {isWon 
              ? `You successfully negotiated a price of $${finalPrice?.toLocaleString()}!` 
              : "The negotiation has concluded without a deal."}
          </p>
          
          <div className="max-w-xs mx-auto space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-tight text-slate-400 block text-left ml-1">Your Name</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter moniker..."
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                    maxLength="20"
                />
            </div>
            <button
                onClick={async () => {
                  if (username.trim()) {
                    try {
                      await axios.post('/api/leaderboard/save-score', {
                        username: username.trim(),
                        finalPrice,
                        rounds: currentRound
                      });
                    } catch (error) {
                      console.error('Save score error', error);
                    }
                  }
                  window.location.reload();
                }}
                disabled={!username.trim()}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
            >
                {isWon ? 'Save Score & Finish' : 'Take me Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                AI
            </div>
            <div>
                <h3 className="font-bold text-slate-900">Virtual Seller</h3>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
                </div>
            </div>
        </div>
        
        <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Progress</div>
            <div className="flex gap-1">
                {[...Array(maxRounds)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-6 rounded-full transition-all duration-500 ${i < currentRound ? 'bg-primary' : 'bg-slate-100'}`}
                    ></div>
                ))}
            </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30 space-y-6 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xs mx-auto">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-500 text-3xl">👋</div>
            <h4 className="font-bold text-slate-900">Start the conversation</h4>
            <p className="text-sm text-slate-500 leading-relaxed">The seller is waiting for your opening offer. Be firm, but fair.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-3xl ${msg.type === 'user'
                ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10'
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                }`}>
                <p className="text-[15px] leading-relaxed font-medium">{msg.text}</p>
                {msg.counterPrice && !msg.accept && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Counter Offer</span>
                    <span className="text-sm font-black text-primary">${msg.counterPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
            <div className="flex justify-start animate-pulse">
                <div className="bg-white px-6 py-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="number"
            value={userOffer}
            onChange={(e) => setUserOffer(e.target.value)}
            placeholder="Place your offer price..."
            className="w-full pl-10 pr-32 py-5 bg-slate-50 border-none rounded-2xl font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-300"
            disabled={loading || gameStatus !== 'ongoing'}
            min="1"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
          <button
            type="submit"
            disabled={loading || !userOffer || gameStatus !== 'ongoing'}
            className="absolute right-2 top-2 bottom-2 px-8 bg-primary text-white font-black rounded-xl hover:bg-black transition-all disabled:opacity-20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
          >
            Send <span className="text-xl">→</span>
          </button>
        </form>
        <p className="mt-4 text-[10px] text-center font-bold text-slate-300 uppercase tracking-[0.2em]">
            Negotiation round {currentRound} of {maxRounds}
        </p>
      </div>
    </div>
  );
};

export default GameChat;

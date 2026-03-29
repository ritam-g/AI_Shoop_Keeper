import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * GameChat Component
 * Manages the core negotiation logic and interactive UI.
 * 
 * State Management:
 * - messages: Array of objects representing the chat history (user vs AI).
 * - gameStatus: Tracks if the negotiation is 'ongoing' or 'ended'.
 * - currentRound/maxRounds: Tracks progress against the negotiation limit.
 * - gameResultStatus: Determines if the outcome was a WIN, LOSS, or INVALID.
 */
const GameChat = ({ sessionId, product }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([]);
  const [userOffer, setUserOffer] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState('ongoing');
  const [isWon, setIsWon] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(7);
  const [finalPrice, setFinalPrice] = useState(null);
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message when the messages array updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [gameResultStatus, setGameResultStatus] = useState('PENDING'); // WIN, LOSS, INVALID

  /**
   * handleSubmit:
   * 1. Captures user input and updates the UI immediately for responsiveness.
   * 2. Sends the offer to the backend API.
   * 3. Processes the AI's response, updating round counts and game status.
   * 4. Triggers end-of-game state if the deal is closed.
   */
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

      const { aiResponse, counterPrice, accept, isWon: won, status: resultStatus, currentRound: round, maxRounds: max, isDealClosed, finalPrice: final } = response.data;

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
          setGameResultStatus(resultStatus);
          setGameStatus('ended');
        }
        setLoading(false);
      }, 600);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { type: 'system', text: 'Connection lost. Please try again.' }]);
      setLoading(false);
    }
  };

  // Render the end-of-game summary screen
  if (gameStatus === 'ended') {
    const isInvalid = gameResultStatus === 'INVALID';
    const isLoss = gameResultStatus === 'LOSS';

    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-500 max-w-2xl mx-auto">
        <div className={`p-10 text-center ${isWon ? 'bg-emerald-50' : isLoss ? 'bg-slate-50' : 'bg-rose-50'}`}>
          <div className="mb-6 relative mx-auto h-32 w-32">
            <img src={product?.image} alt={product?.name} className="h-full w-full object-cover rounded-2xl shadow-lg ring-4 ring-white" />
            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg text-xl">
              {isWon ? '🎉' : isLoss ? '🤝' : '🚫'}
            </div>
          </div>
          <h2 className="text-3xl font-black mb-2">
            {isWon ? <span className="gradient-text-primary">Deal Accepted!</span> : isLoss ? 'Negotiation Ended' : <span className="gradient-text-rose">Negotiation Invalid!</span>}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            {isInvalid
              ? "Negotiation failed. You need more interaction to count as a deal (min 1 round)."
              : isWon
                ? <span>You successfully negotiated a price of <span className="gradient-text-secondary font-black">${finalPrice?.toLocaleString()}</span> for <span className="font-bold text-slate-900">{product?.name}</span>!</span>
                : `The negotiation for ${product?.name} concluded without a firm deal.`}
          </p>

          <div className="max-w-xs mx-auto space-y-4">
            {!isInvalid && (
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
            )}
            <button
              onClick={async () => {
                if (username.trim() && !isInvalid) {
                  try {
                    await axios.post('/api/leaderboard/save-score', {
                      username: username.trim(),
                      sessionId
                    });
                  } catch (error) {
                    console.error('Save score error', error);
                  }
                }
                navigate('/')
              }}
              disabled={!username.trim() && !isInvalid}
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
    <div className="flex flex-col md:flex-row h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-w-6xl mx-auto w-full">
      <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-6 space-y-6">
          <div className="relative group">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-slate-200 bg-white">
              <img src={product?.image} alt={product?.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-black tracking-widest text-primary uppercase">
              Brand New
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 leading-tight">{product?.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 line-through">${(product?.basePrice * 1.2).toLocaleString()}</span>
              <span className="text-lg font-black text-slate-800">${product?.basePrice?.toLocaleString()}</span>
            </div>
            <div className="pt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">Base Price</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Negotiation Progress</span>
              <span className="text-primary">{currentRound}/{maxRounds}</span>
            </div>
            <div className="flex gap-1 h-1.5 w-full">
              {[...Array(maxRounds)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-500 ${i < currentRound ? 'bg-primary' : 'bg-slate-100'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">AI</div>
            <div>
              <p className="text-xs font-bold text-slate-900">Virtual Seller</p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Agent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-slate-50 flex items-center justify-between md:hidden uppercase tracking-widest text-[10px] font-black text-slate-400">
          <span>Negotiation Stage</span>
          <span className="text-primary">Round {currentRound}</span>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/20 space-y-6 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xs mx-auto animate-in fade-in duration-1000">
              <div className="p-6 bg-white shadow-xl shadow-black/5 rounded-3xl text-4xl mb-2">🎁</div>
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">Make your first offer</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">The seller is ready to talk about the <b>{product?.name}</b>. Don't be shy, start high or low, it's up to you!</p>
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Seller Counter</span>
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

        <div className="p-6 md:p-8 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <input
              type="number"
              value={userOffer}
              onChange={(e) => setUserOffer(e.target.value)}
              placeholder={`Enter your offer for ${product?.name}...`}
              className="w-full pl-10 pr-32 py-5 bg-slate-50 border-none rounded-2xl font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-300 shadow-inner"
              disabled={loading || gameStatus !== 'ongoing'}
              min="1"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</div>
            <button
              type="submit"
              disabled={loading || !userOffer || gameStatus !== 'ongoing'}
              className="absolute right-2 top-2 bottom-2 px-8 bg-primary text-white font-black rounded-xl hover:bg-black transition-all disabled:opacity-20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              Offer <span className="text-xl">→</span>
            </button>
          </form>
          <p className="mt-4 text-[10px] text-center font-extrabold text-slate-300 uppercase tracking-[0.3em]">
            Strictly 7 rounds to close the deal
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameChat;

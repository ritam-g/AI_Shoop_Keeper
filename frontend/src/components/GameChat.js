import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GameChat = ({ sessionId, onGameEnd }) => {
  const [messages, setMessages] = useState([]);
  const [userOffer, setUserOffer] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState('ongoing'); // 'ongoing', 'won', 'lost'
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(7);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userOffer || loading) return;

    const offerNum = parseFloat(userOffer);
    if (isNaN(offerNum) || offerNum <= 0) return;

    setLoading(true);
    const userMessage = { type: 'user', text: `Offer: $${offerNum.toLocaleString()}`, offer: offerNum };
    setMessages(prev => [...prev, userMessage]);
    setUserOffer('');

    try {
      const response = await axios.post('http://localhost:5000/api/sessions/negotiate', {
        sessionId,
        userOffer: offerNum
      });

      const aiMessage = { 
        type: 'ai', 
        text: response.data.aiResponse,
        counterPrice: response.data.counterPrice,
        accept: response.data.accept,
        round: response.data.currentRound
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentRound(response.data.currentRound);
      setMaxRounds(response.data.maxRounds);

      if (response.data.isDealClosed) {
        setGameStatus(response.data.accept ? 'won' : 'lost');
        onGameEnd(response.data.finalPrice, response.data.accept);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { type: 'system', text: 'Error: ' + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  if (gameStatus !== 'ongoing') {
    return (
      <div className="text-center p-8">
        <div className="text-2xl font-bold mb-4">
          {gameStatus === 'won' ? '🎉 Deal Closed!' : 'Game Over'}
        </div>
        <p className="text-lg text-gray-600 mb-8">Final Price: ${finalPrice?.toLocaleString()}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white">
        <h3 className="text-xl font-bold mb-2">Negotiation Chat</h3>
        <p className="text-sm opacity-90">Round {currentRound}/{maxRounds}</p>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Make your first offer below!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.type === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-white shadow border border-gray-200'
              }`}>
                <p>{msg.text}</p>
                {msg.counterPrice && (
                  <p className="text-sm mt-1 opacity-90 font-semibold">
                    Counter: ${msg.counterPrice.toLocaleString()}
                  </p>
                )}
                {msg.type === 'ai' && msg.accept && (
                  <span className="inline-block ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Accepted
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-6 bg-white border-t">
        <div className="flex gap-3">
          <input
            type="number"
            value={userOffer}
            onChange={(e) => setUserOffer(e.target.value)}
            placeholder="Enter your offer ($)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            disabled={loading}
            min="100"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameChat;

import React from 'react';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    🤝 AI Negotiation Game
                </h1>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <p className="text-lg text-gray-600 text-center mb-8">
                        Negotiate with AI seller to get the best deal on Premium Wireless Headphones!
                    </p>
                    <div className="text-center">
                        <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                            Start New Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductSelection = ({ onSelect, loading }) => {
    const [products, setProducts] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/sessions/products');
                setProducts(response.data.products);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setFetching(false);
            }
        };
        fetchProducts();
    }, []);

    if (fetching) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {products.map((product) => (
                <div 
                    key={product.name}
                    className="group relative bg-white rounded-[2rem] border border-slate-100 p-4 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-2 cursor-pointer"
                    onClick={() => !loading && onSelect(product.name)}
                >
                    <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-6 bg-slate-50">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                             <div className="bg-white/90 backdrop-blur py-3 rounded-xl text-center shadow-xl">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Product</span>
                             </div>
                        </div>
                    </div>

                    <div className="px-2 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black gradient-text-primary tracking-tight">{product.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Stock</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</span>
                                <span className="text-lg font-black gradient-text-secondary">${product.basePrice.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                             <button 
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-primary hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95"
                                disabled={loading}
                            >
                                Start Negotiation
                                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductSelection;

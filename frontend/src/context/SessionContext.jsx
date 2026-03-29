import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        const savedSession = localStorage.getItem('ai_shop_session');
        if (savedSession) {
            const parsed = JSON.parse(savedSession);
            setSessionId(parsed.sessionId);
            setProduct(parsed.product);
        }
    }, []);

    const resetSession = () => {
        setSessionId(null);
        setProduct(null);
        localStorage.removeItem('ai_shop_session');
    };

    const value = {
        sessionId,
        setSessionId,
        product,
        setProduct,
        loading,
        setLoading,
        isHydrated,
        resetSession
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

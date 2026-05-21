import React, { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../api/mockApi';
import { Loader } from '../components/Loader';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => { setLoading(false); }, []);
    const login = async (email, password) => {
        setLoading(true);
        const { user, error } = await api.signIn(email, password);
        if (user) setUser(user);
        setLoading(false);
        return { error };
    };
    const logout = async () => { await api.signOut(); setUser(null); };
    return <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

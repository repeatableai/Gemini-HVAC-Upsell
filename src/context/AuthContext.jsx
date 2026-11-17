import React, { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../api/mockApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On the database version, a returning user stays signed in.
    useEffect(() => {
        let active = true;
        (api.restoreSession ? api.restoreSession() : Promise.resolve(null))
            .then((u) => { if (active && u) setUser(u); })
            .catch(() => {})
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    // The login screen shows its own spinner, so a failed sign-in keeps its message on screen.
    const login = async (email, password) => {
        const { user, error } = await api.signIn(email, password);
        if (user) setUser(user);
        return { error };
    };
    const logout = async () => { await api.signOut(); setUser(null); };
    return <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

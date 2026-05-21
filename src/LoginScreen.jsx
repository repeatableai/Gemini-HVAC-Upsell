import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Loader } from './components/Loader';

export const LoginScreen = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        const { error } = await login(email, password);
        if (error) { setError(error.message); setLoading(false); }
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <div className="mx-auto h-12 w-12 mb-4 bg-[#004B87] rounded-lg flex items-center justify-center text-white font-bold text-xl">SP</div>
                    <h1 className="text-4xl font-bold text-gray-800">ServicePro Portal</h1>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Universal Login</h2>
                    <p className="text-center text-gray-500 mb-6">Enter your credentials to continue.</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="email">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-100" placeholder="admin@demo.com or tech@demo.com"/>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="password">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-100" placeholder="any password"/>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-[#004B87] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center h-12">
                            {loading ? <Loader small={true} /> : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

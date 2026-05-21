import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';

export const SettingsScreen = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);

    useEffect(() => {
        api.getCompanyConfig().then(({ data }) => { setConfig(data); setLoading(false); });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        await api.saveCompanyConfig(config);
        setLoading(false);
        alert("Settings saved!");
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNotifChange = (key) => {
        setConfig(prev => ({
            ...prev,
            notification_preferences: {
                ...prev.notification_preferences,
                [key]: !prev.notification_preferences[key],
            }
        }));
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        setConnectionStatus(null);
        // Simulated connection test
        await new Promise(res => setTimeout(res, 1500));
        setConnectionStatus('connected');
        setTestingConnection(false);
    };

    if (loading || !config) return <div className="p-8 flex justify-center"><Loader /></div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 mb-8">Configure integrations, goals, and notifications.</p>

            <form onSubmit={handleSave} className="space-y-8 max-w-2xl">

                {/* Order Routing */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Order Submission Routing</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Routing Method</label>
                            <select name="order_routing_type" value={config.order_routing_type} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="email">Email</option>
                                <option value="webhook">Webhook</option>
                                <option value="accounting">Accounting System</option>
                            </select>
                        </div>

                        {config.order_routing_type === 'accounting' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Accounting System</label>
                                    <select name="accounting_system" value={config.accounting_system || 'none'} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="none">Select...</option>
                                        <option value="quickbooks">QuickBooks</option>
                                        <option value="servicetitan">ServiceTitan</option>
                                        <option value="housecallpro">Housecall Pro</option>
                                    </select>
                                </div>
                                {config.accounting_system && config.accounting_system !== 'none' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">API Key / Connection Token</label>
                                            <input name="accounting_api_key" value={config.accounting_api_key || ''} onChange={handleInputChange}
                                                type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Enter API key..." />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button type="button" onClick={handleTestConnection} disabled={testingConnection}
                                                className="bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
                                                {testingConnection ? <><Loader small={true} /> Testing...</> : 'Test Connection'}
                                            </button>
                                            {connectionStatus === 'connected' && (
                                                <span className="flex items-center gap-1 text-green-700 text-sm font-medium">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Connected
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Destination</label>
                                <input name="order_routing_target" value={config.order_routing_target} onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder={config.order_routing_type === 'email' ? 'orders@company.com' : 'https://api.yoursystem.com/webhook'} />
                                <p className="mt-2 text-sm text-gray-500">
                                    {config.order_routing_type === 'email'
                                        ? 'Enter the email address to receive order notifications.'
                                        : 'Enter the webhook URL to post order data to.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Goals */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Goals</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Monthly Revenue Goal ($)</label>
                                <input name="monthly_revenue_goal" type="number" value={config.monthly_revenue_goal || 40000}
                                    onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="0" step="1000" />
                                <p className="text-xs text-gray-500 mt-1">Shown as thermometer on dashboard</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Min Presentations / Month</label>
                                <input name="min_presentations_per_month" type="number" value={config.min_presentations_per_month || 20}
                                    onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="1" />
                                <p className="text-xs text-gray-500 mt-1">Below this = "Below Goal"</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Approval Rate (%)</label>
                                <input name="target_approval_rate" type="number" value={config.target_approval_rate || 25}
                                    onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="1" max="100" />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input name="flag_underperformers" type="checkbox" checked={config.flag_underperformers !== false}
                                onChange={handleInputChange} className="h-4 w-4 text-blue-600 rounded" />
                            <label className="ml-2 block text-sm text-gray-700">Flag underperformers on dashboard leaderboard</label>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Notification Preferences</h2>
                    <div className="space-y-3">
                        {[
                            { key: 'email_on_approve', label: 'Email admin on every approved order' },
                            { key: 'email_on_decline', label: 'Email admin on every declined offer' },
                            { key: 'weekly_summary', label: 'Weekly performance summary email' },
                            { key: 'underperformer_alert', label: 'Alert when a technician falls below goal' },
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center">
                                <input type="checkbox" checked={config.notification_preferences?.[key] || false}
                                    onChange={() => handleNotifChange(key)} className="h-4 w-4 text-blue-600 rounded" />
                                <label className="ml-2 block text-sm text-gray-700">{label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={loading}
                        className="bg-[#004B87] text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-800 disabled:bg-blue-300">
                        {loading ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

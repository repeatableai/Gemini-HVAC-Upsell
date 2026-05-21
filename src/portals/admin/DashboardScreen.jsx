import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { XIcon } from '../../components/Icons';

// =========================================================================
// TIME PERIOD SELECTOR
// =========================================================================
const periods = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
    { label: 'All Time', value: 365 },
];

// =========================================================================
// TECHNICIAN DETAIL MODAL
// =========================================================================
const TechnicianDetailModal = ({ tech, onClose }) => {
    const [detail, setDetail] = useState(null);
    useEffect(() => {
        api.getTechnicianStats(tech.technician_id).then(({ data }) => setDetail(data));
    }, [tech.technician_id]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{tech.name} — Performance Detail</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><XIcon /></button>
                </div>

                {!detail ? (
                    <div className="flex justify-center p-8"><Loader /></div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold">{detail.visits}</p>
                                <p className="text-sm text-gray-500">Visits</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold">{detail.presented}</p>
                                <p className="text-sm text-gray-500">Presented</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600">{(detail.closeRate * 100).toFixed(0)}%</p>
                                <p className="text-sm text-gray-500">Close Rate</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold">${detail.revenue.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Revenue</p>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Activity</h3>
                        <div className="space-y-2">
                            {detail.recentEvents.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
                            {detail.recentEvents.map(evt => (
                                <div key={evt.id} className={`flex items-center justify-between p-3 rounded-lg ${evt.outcome === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div>
                                        <p className="font-medium text-gray-800">{evt.service_name}</p>
                                        <p className="text-sm text-gray-500">{new Date(evt.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${evt.outcome === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {evt.outcome === 'approved' ? 'Approved' : 'Declined'}
                                        </span>
                                        {evt.outcome === 'approved' && <p className="text-sm font-semibold text-green-700 mt-1">${evt.revenue}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// =========================================================================
// LEADERBOARD
// =========================================================================
const Leaderboard = ({ byTechnician, config }) => {
    const [sortKey, setSortKey] = useState('revenue');
    const [sortDir, setSortDir] = useState('desc');
    const [selectedTech, setSelectedTech] = useState(null);

    const goal = config?.min_presentations_per_month || 20;
    const flagUnderperformers = config?.flag_underperformers !== false;

    const sorted = [...byTechnician].sort((a, b) => {
        const av = a[sortKey] || 0;
        const bv = b[sortKey] || 0;
        return sortDir === 'desc' ? bv - av : av - bv;
    });

    // Company averages
    const avg = byTechnician.length > 0 ? {
        visits: Math.round(byTechnician.reduce((s, t) => s + t.visits, 0) / byTechnician.length),
        presented: Math.round(byTechnician.reduce((s, t) => s + t.presented, 0) / byTechnician.length),
        approved: Math.round(byTechnician.reduce((s, t) => s + t.approved, 0) / byTechnician.length),
        revenue: Math.round(byTechnician.reduce((s, t) => s + t.revenue, 0) / byTechnician.length),
    } : null;

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const rankColors = ['', 'text-yellow-600', 'text-gray-500', 'text-amber-700'];
    const rankLabels = ['', '1st', '2nd', '3rd'];

    const SortHeader = ({ label, field, className = '' }) => (
        <th onClick={() => handleSort(field)} className={`p-3 font-semibold text-gray-600 cursor-pointer hover:text-blue-600 select-none ${className}`}>
            {label} {sortKey === field ? (sortDir === 'desc' ? ' \u2193' : ' \u2191') : ''}
        </th>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Technician Leaderboard</h3>
            <p className="text-sm text-gray-500 mb-4">Monthly goal: {goal} presentations. Click a row for details.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200">
                        <tr>
                            <th className="p-3 font-semibold text-gray-600 w-12">Rank</th>
                            <th className="p-3 font-semibold text-gray-600">Technician</th>
                            <SortHeader label="Visits" field="visits" />
                            <SortHeader label="Presented" field="presented" />
                            <th className="p-3 font-semibold text-gray-600">Present %</th>
                            <SortHeader label="Approved" field="approved" />
                            <th className="p-3 font-semibold text-gray-600">Close %</th>
                            <SortHeader label="Revenue" field="revenue" />
                            <th className="p-3 font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((tech, idx) => {
                            const rank = idx + 1;
                            const presentRate = tech.visits > 0 ? (tech.presented / tech.visits * 100) : 0;
                            const closeRate = tech.presented > 0 ? (tech.approved / tech.presented * 100) : 0;
                            const belowGoal = flagUnderperformers && tech.presented < goal;

                            return (
                                <tr key={tech.technician_id}
                                    onClick={() => setSelectedTech(tech)}
                                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${belowGoal ? 'bg-red-50/50' : ''}`}>
                                    <td className={`p-3 font-bold ${rankColors[rank] || 'text-gray-400'}`}>
                                        {rank <= 3 ? rankLabels[rank] : `#${rank}`}
                                    </td>
                                    <td className="p-3 font-medium text-gray-800">{tech.name}</td>
                                    <td className="p-3">{tech.visits}</td>
                                    <td className="p-3 font-semibold">{tech.presented}</td>
                                    <td className="p-3">{presentRate.toFixed(0)}%</td>
                                    <td className="p-3 text-green-700 font-semibold">{tech.approved}</td>
                                    <td className="p-3">{closeRate.toFixed(0)}%</td>
                                    <td className="p-3 font-bold">${tech.revenue.toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${belowGoal ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {belowGoal ? 'Below Goal' : 'On Track'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Company average row */}
                        {avg && (
                            <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold text-gray-600">
                                <td className="p-3"></td>
                                <td className="p-3">Company Average</td>
                                <td className="p-3">{avg.visits}</td>
                                <td className="p-3">{avg.presented}</td>
                                <td className="p-3">{avg.visits > 0 ? (avg.presented / avg.visits * 100).toFixed(0) : 0}%</td>
                                <td className="p-3">{avg.approved}</td>
                                <td className="p-3">{avg.presented > 0 ? (avg.approved / avg.presented * 100).toFixed(0) : 0}%</td>
                                <td className="p-3">${avg.revenue.toLocaleString()}</td>
                                <td className="p-3"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedTech && <TechnicianDetailModal tech={selectedTech} onClose={() => setSelectedTech(null)} />}
        </div>
    );
};

// =========================================================================
// MAIN DASHBOARD
// =========================================================================
export const DashboardScreen = () => {
    const [stats, setStats] = useState(null);
    const [period, setPeriod] = useState(30);
    const [pairings, setPairings] = useState([]);

    useEffect(() => {
        setStats(null);
        setPairings([]);
        Promise.all([
            api.getDashboardStats(period),
            api.getServicePairings(period),
        ]).then(([statsRes, pairingsRes]) => {
            setStats(statsRes.data);
            setPairings(pairingsRes.data);
        });
    }, [period]);

    if (!stats) return <div className="p-8 flex justify-center"><Loader /></div>;

    const pieData = [
        { name: 'Approved', value: stats.approvedCount },
        { name: 'Declined', value: stats.declinedCount },
    ];
    const PIE_COLORS = ['#10B981', '#EF4444'];

    const serviceChartData = stats.byService.map(s => ({
        name: s.name.length > 18 ? s.name.substring(0, 18) + '...' : s.name,
        Approved: s.approved,
        Declined: s.declined,
    }));

    return (
        <div className="p-4 sm:p-8">
            {/* Header + Period Selector */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Performance overview</p>
                </div>
                <div className="flex bg-white rounded-lg shadow p-1 gap-1">
                    {periods.map(p => (
                        <button key={p.value} onClick={() => setPeriod(p.value)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === p.value ? 'bg-[#004B87] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Revenue Goal Thermometer */}
            {stats.config.monthly_revenue_goal > 0 && (
                <div className="bg-white p-6 rounded-xl shadow mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-gray-800">Monthly Revenue Goal</h3>
                        <span className="text-sm text-gray-500">${stats.totalRevenue.toLocaleString()} of ${stats.config.monthly_revenue_goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                            className={`h-6 rounded-full transition-all flex items-center justify-end pr-2 text-xs font-bold text-white ${
                                stats.totalRevenue >= stats.config.monthly_revenue_goal ? 'bg-green-500' : 'bg-[#004B87]'
                            }`}
                            style={{ width: `${Math.min(100, (stats.totalRevenue / stats.config.monthly_revenue_goal) * 100)}%` }}
                        >
                            {((stats.totalRevenue / stats.config.monthly_revenue_goal) * 100).toFixed(0)}%
                        </div>
                    </div>
                    {stats.totalRevenue >= stats.config.monthly_revenue_goal && (
                        <p className="text-green-600 font-semibold text-sm mt-2">Goal reached!</p>
                    )}
                </div>
            )}

            {/* Top stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl shadow">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Offers</h3>
                    <p className="text-3xl font-bold mt-1">{stats.totalPresented}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow">
                    <h3 className="text-gray-500 text-sm font-semibold">Approved</h3>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.approvedCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow">
                    <h3 className="text-gray-500 text-sm font-semibold">Declined</h3>
                    <p className="text-3xl font-bold text-red-500 mt-1">{stats.declinedCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow">
                    <h3 className="text-gray-500 text-sm font-semibold">Approval Rate</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{(stats.approvalRate * 100).toFixed(1)}%</p>
                </div>
                {/* Lost Revenue Card */}
                <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow">
                    <h3 className="text-red-600 text-sm font-semibold">Left on the Table</h3>
                    <p className="text-3xl font-bold text-red-600 mt-1">${stats.lostRevenue?.toLocaleString() || 0}</p>
                    <p className="text-xs text-red-500 mt-1">Est. revenue from declines</p>
                </div>
            </div>

            {/* Revenue cards by type */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow">
                    <h3 className="text-gray-500 text-sm font-semibold">Total Revenue</h3>
                    <p className="text-3xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                {['HVAC', 'Plumbing', 'Energy'].map(type => (
                    <div key={type} className="bg-white p-5 rounded-xl shadow">
                        <h3 className="text-gray-500 text-sm font-semibold">{type} Revenue</h3>
                        <p className="text-2xl font-bold mt-1">${(stats.revenueByType[type] || 0).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Per-Service Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={serviceChartData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Approved" fill="#10B981" />
                            <Bar dataKey="Declined" fill="#EF4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Offer Outcomes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} labelLine={false} outerRadius={100} dataKey="value" nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Presentation Rate by Service */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Presentation Share by Service</h3>
                <div className="space-y-3">
                    {stats.byService.sort((a, b) => b.presented - a.presented).map(svc => {
                        const pct = stats.totalPresented > 0 ? (svc.presented / stats.totalPresented * 100) : 0;
                        const approvalPct = svc.presented > 0 ? (svc.approved / svc.presented * 100) : 0;
                        return (
                            <div key={svc.service_id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{svc.name}</span>
                                    <span className="text-gray-500">{svc.presented} presented ({pct.toFixed(0)}%) &middot; {approvalPct.toFixed(0)}% close rate &middot; ${svc.revenue.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-[#004B87] h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Decline Reasons + Service Pairings row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Decline Reasons Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Why Customers Decline</h3>
                    {Object.keys(stats.declineReasons || {}).length === 0 ? (
                        <p className="text-gray-500 text-sm">No decline data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(stats.declineReasons)
                                .sort(([,a], [,b]) => b - a)
                                .map(([reason, count]) => {
                                    const total = Object.values(stats.declineReasons).reduce((s, v) => s + v, 0);
                                    const pct = total > 0 ? (count / total * 100) : 0;
                                    const labels = {
                                        too_expensive: 'Too expensive',
                                        not_now: 'Not right now',
                                        already_have: 'Already have it',
                                        think_about_it: 'Wants to think about it',
                                        no_interest: 'Not interested',
                                        spouse_decision: 'Needs spouse approval',
                                        other: 'Other',
                                        unknown: 'No reason given',
                                    };
                                    return (
                                        <div key={reason}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{labels[reason] || reason}</span>
                                                <span className="text-gray-500">{count} ({pct.toFixed(0)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-red-400 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Service Pairing Insights */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Service Pairing Insights</h3>
                    <p className="text-sm text-gray-500 mb-4">Services frequently approved together or on the same day</p>
                    {pairings.length === 0 ? (
                        <p className="text-gray-500 text-sm">Not enough data for pairing analysis yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {pairings.map((pair, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <span className="text-2xl font-bold text-gray-300 w-8">{idx + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">
                                            {pair.service1} <span className="text-gray-400 mx-1">+</span> {pair.service2}
                                        </p>
                                        <p className="text-xs text-gray-500">Paired {pair.count} time{pair.count > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Leaderboard */}
            <Leaderboard byTechnician={stats.byTechnician} config={stats.config} />
        </div>
    );
};

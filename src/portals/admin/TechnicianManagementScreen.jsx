import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { TrashIcon, EditIcon, XIcon, CheckIcon } from '../../components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// =========================================================================
// TECH PROFILE MODAL — full performance view
// =========================================================================
const TechProfileModal = ({ tech, onClose }) => {
    const [stats30, setStats30] = useState(null);
    const [stats90, setStats90] = useState(null);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        Promise.all([
            api.getTechnicianStats(tech.id, 30),
            api.getTechnicianStats(tech.id, 90),
            api.getCompanyConfig(),
        ]).then(([res30, res90, configRes]) => {
            setStats30(res30.data);
            setStats90(res90.data);
            setConfig(configRes.data);
        });
    }, [tech.id]);

    if (!stats30 || !stats90 || !config) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl flex justify-center"><Loader /></div>
            </div>
        );
    }

    const goal = config.min_presentations_per_month || 20;
    const belowGoal = stats30.presented < goal;

    // Build daily activity for last 30 days
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toDateString();
        const dayEvents = stats30.recentEvents?.filter(e => new Date(e.timestamp).toDateString() === dayStr) || [];
        const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
        dailyData.push({
            day: dayLabel,
            approved: dayEvents.filter(e => e.outcome === 'approved').length,
            declined: dayEvents.filter(e => e.outcome === 'declined').length,
        });
    }

    // Service breakdown from recent events
    const serviceBreakdown = {};
    (stats30.recentEvents || []).forEach(e => {
        const name = e.service_name || e.service_id;
        if (!serviceBreakdown[name]) serviceBreakdown[name] = { name, approved: 0, declined: 0 };
        if (e.outcome === 'approved') serviceBreakdown[name].approved++;
        else serviceBreakdown[name].declined++;
    });

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{tech.full_name}</h2>
                        <p className="text-gray-500 text-sm">{tech.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tech.status === 'active' ? 'bg-green-100 text-green-800' : tech.status === 'invited' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                                {tech.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${belowGoal ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>
                                {belowGoal ? 'Below Goal' : 'On Track'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close" data-help="Closes this profile and returns to the technician list."><XIcon /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* KPI Cards — 30 day */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Last 30 Days</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-800">{stats30.visits}</p>
                                <p className="text-xs text-gray-500">Visits</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-800">{stats30.presented}</p>
                                <p className="text-xs text-gray-500">Presented</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600">{stats30.approved}</p>
                                <p className="text-xs text-gray-500">Approved</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-blue-600">{(stats30.closeRate * 100).toFixed(0)}%</p>
                                <p className="text-xs text-gray-500">Close Rate</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-800">${stats30.revenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Presentation Goal Progress */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">Presentation Goal: {stats30.presented} / {goal}</span>
                            <span className="text-gray-500">{((stats30.presented / goal) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${stats30.presented >= goal ? 'bg-green-500' : stats30.presented >= goal * 0.7 ? 'bg-amber-400' : 'bg-red-400'}`}
                                style={{ width: `${Math.min(100, (stats30.presented / goal) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Presentation Rate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="text-3xl font-bold text-blue-700">{(stats30.presentationRate * 100).toFixed(0)}%</p>
                            <p className="text-sm text-blue-600">Presentation Rate (30d)</p>
                            <p className="text-xs text-blue-500 mt-1">Presented on {stats30.presented} of {stats30.visits} visits</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                            <p className="text-3xl font-bold text-purple-700">{(stats90.presentationRate * 100).toFixed(0)}%</p>
                            <p className="text-sm text-purple-600">Presentation Rate (90d)</p>
                            <p className="text-xs text-purple-500 mt-1">Presented on {stats90.presented} of {stats90.visits} visits</p>
                        </div>
                    </div>

                    {/* 90-Day Comparison */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">90-Day Overview</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-xl font-bold">{stats90.visits}</p>
                                <p className="text-xs text-gray-500">Total Visits</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-xl font-bold">{stats90.approved}</p>
                                <p className="text-xs text-gray-500">Total Approved</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-xl font-bold">${stats90.revenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Total Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Daily Activity Chart */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Daily Activity (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={dailyData}>
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={4} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
                                <Bar dataKey="declined" stackId="a" fill="#EF4444" name="Declined" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Service Breakdown */}
                    {Object.keys(serviceBreakdown).length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Services Presented</h3>
                            <div className="space-y-2">
                                {Object.values(serviceBreakdown).sort((a, b) => (b.approved + b.declined) - (a.approved + a.declined)).map(svc => (
                                    <div key={svc.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <span className="font-medium text-gray-800 text-sm">{svc.name}</span>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-green-600 font-semibold">{svc.approved} approved</span>
                                            <span className="text-red-500">{svc.declined} declined</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Activity</h3>
                        {stats30.recentEvents.length === 0 ? (
                            <p className="text-gray-500 text-sm">No recent activity.</p>
                        ) : (
                            <div className="space-y-2">
                                {stats30.recentEvents.map(evt => (
                                    <div key={evt.id} className={`flex items-center justify-between p-3 rounded-lg ${evt.outcome === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{evt.service_name}</p>
                                            <p className="text-xs text-gray-500">{new Date(evt.timestamp).toLocaleDateString()}</p>
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// EDIT MODAL
// =========================================================================
const EditTechModal = ({ tech, onSave, onClose }) => {
    const [formData, setFormData] = useState({ full_name: tech.full_name, email: tech.email });
    const handleSubmit = (e) => { e.preventDefault(); onSave({ ...tech, ...formData }); };
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Technician</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close" data-help="Closes the edit form without saving."><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input value={formData.full_name} onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))} type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" data-help="The technician's full name." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" data-help="The technician's email address." />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300" data-help="Closes the edit form without saving.">Cancel</button>
                        <button type="submit" className="bg-[#004B87] text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800" data-help="Saves the new name and email.">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =========================================================================
// MAIN SCREEN
// =========================================================================
export const TechnicianManagementScreen = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [editingTech, setEditingTech] = useState(null);
    const [viewingTech, setViewingTech] = useState(null);

    const fetchTechs = () => {
        api.getTechnicians().then(({ data }) => { setTechnicians(data); setLoading(false); });
    };
    useEffect(fetchTechs, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        await api.inviteTechnician(inviteEmail, inviteName);
        setInviteEmail('');
        setInviteName('');
        fetchTechs();
    };

    const handleToggleStatus = async (tech) => {
        const newStatus = tech.status === 'active' ? 'inactive' : 'active';
        await api.updateTechnician({ ...tech, status: newStatus });
        fetchTechs();
    };

    const handleDelete = async (tech) => {
        if (!window.confirm(`Permanently delete ${tech.full_name}? This removes all their data. Consider deactivating instead.`)) return;
        await api.deleteTechnician(tech.id);
        fetchTechs();
    };

    const handleEditSave = async (techData) => {
        await api.updateTechnician(techData);
        setEditingTech(null);
        fetchTechs();
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-200 text-gray-600',
        invited: 'bg-blue-100 text-blue-800',
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Technician Management</h1>
            <p className="text-gray-500 mb-8">Invite and manage your team members. Click a name to view detailed metrics.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Name</th>
                                    <th className="p-4 font-semibold text-gray-600">Email</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {technicians.map(tech => (
                                    <tr key={tech.id} className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${tech.status === 'inactive' ? 'opacity-50' : ''}`}>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setViewingTech(tech)}
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                                                data-help={`Opens ${tech.full_name}'s 30-day and 90-day results.`}
                                            >
                                                {tech.full_name}
                                            </button>
                                        </td>
                                        <td className="p-4 text-gray-600">{tech.email}</td>
                                        <td className="p-4">
                                            <button onClick={() => handleToggleStatus(tech)}
                                                data-help={tech.status === 'active' ? `Switches ${tech.full_name} to inactive.` : `Switches ${tech.full_name} to active.`}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${statusColors[tech.status] || statusColors.inactive}`}>
                                                {tech.status}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setViewingTech(tech)} className="text-sm text-blue-600 font-semibold hover:underline" data-help={`Opens ${tech.full_name}'s 30-day and 90-day results.`}>View</button>
                                                <button onClick={() => setEditingTech(tech)} className="text-blue-600 hover:text-blue-800" aria-label={`Edit ${tech.full_name}`} data-help={`Edits ${tech.full_name}'s name and email.`}><EditIcon /></button>
                                                <button onClick={() => handleDelete(tech)} className="text-red-500 hover:text-red-700" aria-label={`Delete ${tech.full_name}`} data-help={`Deletes ${tech.full_name} and their data, after you confirm.`}><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Invite New Technician</h3>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input value={inviteName} onChange={e => setInviteName(e.target.value)} type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" data-help="The new technician's full name." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" data-help="The email the invite goes to." />
                            </div>
                            <button type="submit" className="w-full bg-[#004B87] text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800" data-help="Adds the technician as invited and sends the invite to their email.">Send Invite</button>
                        </form>
                    </div>
                </div>
            </div>

            {editingTech && <EditTechModal tech={editingTech} onSave={handleEditSave} onClose={() => setEditingTech(null)} />}
            {viewingTech && <TechProfileModal tech={viewingTech} onClose={() => setViewingTech(null)} />}
        </div>
    );
};

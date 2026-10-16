import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { LogOutIcon } from '../../components/Icons';
import { VideoStudioScreen } from '../shared/VideoStudioScreen';

const INDUSTRIES = ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Pest Control', 'Pool Service', 'Landscaping', 'Other'];

const EMPTY_FORM = { name: '', website: '', industry: 'HVAC', brand_color: '#004B87', admin_name: '', admin_email: '' };

const StatusPill = ({ status }) => {
    const styles = status === 'active'
        ? 'bg-green-100 text-green-800'
        : status === 'paused' ? 'bg-gray-200 text-gray-700' : 'bg-amber-100 text-amber-800';
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${styles}`}>{status}</span>;
};

const StatTile = ({ label, value }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1 tabular-nums">{value}</p>
    </div>
);

const AddCompanyForm = ({ onCreated, onCancel }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
    const canSave = form.name.trim() && form.admin_email.trim();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSave) return;
        setSaving(true);
        const { data } = await api.createCompany(form);
        setSaving(false);
        onCreated(data);
    };

    const field = 'w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200';
    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Add a company</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="co_name" className="block text-sm font-medium text-gray-600 mb-1">Company name *</label>
                    <input id="co_name" className={field} value={form.name} onChange={set('name')} placeholder="e.g. Northside HVAC" />
                </div>
                <div>
                    <label htmlFor="co_website" className="block text-sm font-medium text-gray-600 mb-1">Website</label>
                    <input id="co_website" className={field} value={form.website} onChange={set('website')} placeholder="northsidehvac.com" />
                </div>
                <div>
                    <label htmlFor="co_industry" className="block text-sm font-medium text-gray-600 mb-1">Trade</label>
                    <select id="co_industry" className={field} value={form.industry} onChange={set('industry')}>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="co_color" className="block text-sm font-medium text-gray-600 mb-1">Brand colour</label>
                    <div className="flex items-center gap-2">
                        <input id="co_color" type="color" className="h-10 w-14 rounded border border-gray-200" value={form.brand_color} onChange={set('brand_color')} />
                        <span className="text-sm text-gray-600">{form.brand_color}</span>
                    </div>
                </div>
                <div>
                    <label htmlFor="co_admin_name" className="block text-sm font-medium text-gray-600 mb-1">Company admin name</label>
                    <input id="co_admin_name" className={field} value={form.admin_name} onChange={set('admin_name')} placeholder="Owner or service manager" />
                </div>
                <div>
                    <label htmlFor="co_admin_email" className="block text-sm font-medium text-gray-600 mb-1">Company admin email *</label>
                    <input id="co_admin_email" type="email" className={field} value={form.admin_email} onChange={set('admin_email')} placeholder="owner@northsidehvac.com" />
                </div>
            </div>
            <div className="flex gap-3 justify-end">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={!canSave || saving} className="px-4 py-2 rounded-lg text-white bg-[#004B87] hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader small={true} /> : 'Create company and invite admin'}
                </button>
            </div>
        </form>
    );
};

export const SuperAdminPortal = () => {
    const { user, logout } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [notice, setNotice] = useState('');
    const [tab, setTab] = useState('companies');

    const load = useCallback(async () => {
        const [c, s] = await Promise.all([api.getCompanies(), api.getPlatformStats()]);
        setCompanies(c.data);
        setStats(s.data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreated = async (company) => {
        setShowForm(false);
        setNotice(`${company.name} created. Invite sent to ${company.admin_email} (demo: no email is sent).`);
        await load();
    };

    const toggleStatus = async (company) => {
        const next = company.status === 'active' ? 'paused' : 'active';
        await api.updateCompanyStatus(company.id, next);
        await load();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-[#1F2937] text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <p className="font-bold text-lg">Upseller Platform</p>
                    <p className="text-xs text-gray-300">Super admin — build out companies</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-sm">{user.full_name}</span>
                    <button onClick={logout} aria-label="Log out" className="p-2 hover:bg-white/20 rounded-full"><LogOutIcon /></button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 flex gap-2">
                {[['companies', 'Companies'], ['videos', 'Video production']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === key ? 'bg-[#1F2937] text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>{label}</button>
                ))}
            </div>
            {tab === 'videos' ? (
                <div className="max-w-6xl mx-auto"><VideoStudioScreen mode="producer" requestedBy={user.full_name} /></div>
            ) : (
            <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader /></div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatTile label="Companies" value={stats.companies} />
                            <StatTile label="Active" value={stats.activeCompanies} />
                            <StatTile label="Technicians" value={stats.technicians} />
                            <StatTile label="Offers, last 30 days" value={stats.offers30d} />
                            <StatTile label="Upsell revenue, 30 days" value={`$${stats.revenue30d.toLocaleString()}`} />
                        </div>

                        {notice && <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">{notice}</div>}

                        {showForm
                            ? <AddCompanyForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
                            : <button onClick={() => { setShowForm(true); setNotice(''); }} className="px-4 py-2 rounded-lg text-white bg-[#004B87] hover:bg-blue-800 font-semibold">+ Add company</button>
                        }

                        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="text-left p-3">Company</th>
                                        <th className="text-left p-3">Trade</th>
                                        <th className="text-left p-3">Company admin</th>
                                        <th className="text-right p-3">Technicians</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-right p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map(c => (
                                        <tr key={c.id} className="border-t border-gray-100">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-4 w-4 rounded" style={{ backgroundColor: c.brand_color }} />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{c.name}</p>
                                                        <p className="text-xs text-gray-500">{c.website}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-700">{c.industry}</td>
                                            <td className="p-3 text-gray-700">{c.admin_name}<br /><span className="text-xs text-gray-500">{c.admin_email}</span></td>
                                            <td className="p-3 text-right tabular-nums">{c.technicians}</td>
                                            <td className="p-3"><StatusPill status={c.status} /></td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => toggleStatus(c)} className="text-sm text-blue-700 hover:underline">
                                                    {c.status === 'active' ? 'Pause' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500">Companies marked [SYN] are examples. Demo data lives in this browser tab and resets on reload.</p>
                    </>
                )}
            </main>
            )}
        </div>
    );
};

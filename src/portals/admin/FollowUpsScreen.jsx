import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { SearchIcon, XIcon } from '../../components/Icons';

const REASON_LABELS = {
    too_expensive: 'Too expensive',
    not_now: 'Not right now',
    already_have: 'Already have it',
    think_about_it: 'Wants to think about it',
    no_interest: 'Not interested',
    spouse_decision: 'Needs spouse approval',
    other: 'Other',
};

export const FollowUpsScreen = () => {
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addressQuery, setAddressQuery] = useState('');
    const [addressHistory, setAddressHistory] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchFollowUps = () => {
        api.getFollowUps().then(({ data }) => { setFollowUps(data); setLoading(false); });
    };
    useEffect(fetchFollowUps, []);

    const handleDismiss = async (id) => {
        await api.dismissFollowUp(id);
        fetchFollowUps();
    };

    const handleAddressSearch = async () => {
        if (!addressQuery.trim()) return;
        setSearchLoading(true);
        setHasSearched(true);
        const { data } = await api.getAddressHistory(addressQuery);
        setAddressHistory(data || []);
        setSearchLoading(false);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;

    const now = new Date();
    const overdue = followUps.filter(f => new Date(f.follow_up_date) <= now);
    const upcoming = followUps.filter(f => new Date(f.follow_up_date) > now);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Follow-Ups & Address History</h1>
            <p className="text-gray-500 mb-8">Track declined services tagged for re-presentation and view offer history by address.</p>

            {/* Follow-Up Queue */}
            <div className="bg-white rounded-xl shadow mb-8">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Follow-Up Queue</h2>
                    <p className="text-sm text-gray-500 mt-1">{followUps.length} pending follow-up{followUps.length !== 1 ? 's' : ''}</p>
                </div>

                {followUps.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No pending follow-ups. When technicians tag declined services for follow-up, they'll appear here.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Address</th>
                                    <th className="p-4 font-semibold text-gray-600">Service</th>
                                    <th className="p-4 font-semibold text-gray-600">Decline Reason</th>
                                    <th className="p-4 font-semibold text-gray-600">Declined</th>
                                    <th className="p-4 font-semibold text-gray-600">Follow-Up Date</th>
                                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...overdue, ...upcoming].map(fu => {
                                    const isOverdue = new Date(fu.follow_up_date) <= now;
                                    return (
                                        <tr key={fu.id} className={`border-b border-gray-100 ${isOverdue ? 'bg-amber-50' : ''}`}>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isOverdue ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>
                                                    {isOverdue ? 'Due Now' : 'Upcoming'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-gray-800">{fu.address}</td>
                                            <td className="p-4 text-gray-700">{fu.service_name}</td>
                                            <td className="p-4 text-gray-600">{REASON_LABELS[fu.decline_reason] || fu.decline_reason || '—'}</td>
                                            <td className="p-4 text-gray-500">{new Date(fu.declined_date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`font-medium ${isOverdue ? 'text-amber-700' : 'text-gray-600'}`}>
                                                    {new Date(fu.follow_up_date).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => handleDismiss(fu.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Dismiss" data-help={`Dismisses the follow-up for ${fu.service_name} at ${fu.address}.`}>
                                                    <XIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Address History Search */}
            <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Address History Lookup</h2>
                    <p className="text-sm text-gray-500 mt-1">Search any address to see what's been offered there before.</p>
                </div>
                <div className="p-6">
                    <div className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={addressQuery}
                            onChange={(e) => setAddressQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                            className="flex-1 px-4 py-3 rounded-lg bg-gray-100 border border-gray-200"
                            placeholder="Enter address to search..."
                            data-help="Type part of an address, then press Enter or Search."
                        />
                        <button onClick={handleAddressSearch} disabled={searchLoading} className="px-6 py-3 bg-[#004B87] text-white font-semibold rounded-lg hover:bg-blue-800 flex items-center gap-2 disabled:bg-blue-300" data-help="Shows each offer made at matching addresses, with outcome, technician and date.">
                            {searchLoading ? <Loader small={true} /> : <><SearchIcon /> Search</>}
                        </button>
                    </div>

                    {hasSearched && (
                        addressHistory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="font-medium">No history found for this address.</p>
                                <p className="text-sm mt-1">No services have been offered at addresses matching "{addressQuery}"</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-500 mb-3">{addressHistory.length} record{addressHistory.length !== 1 ? 's' : ''} found</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-600">Address</th>
                                                <th className="p-3 font-semibold text-gray-600">Service</th>
                                                <th className="p-3 font-semibold text-gray-600">Outcome</th>
                                                <th className="p-3 font-semibold text-gray-600">Technician</th>
                                                <th className="p-3 font-semibold text-gray-600">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {addressHistory.map((h, idx) => (
                                                <tr key={idx} className="border-b border-gray-100">
                                                    <td className="p-3 font-medium text-gray-800">{h.address}</td>
                                                    <td className="p-3 text-gray-700">{h.service_name}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${h.outcome === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {h.outcome}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-600">{h.technician}</td>
                                                    <td className="p-3 text-gray-500">{new Date(h.date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

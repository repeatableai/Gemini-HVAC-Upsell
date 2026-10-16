import React, { useState, useEffect } from 'react';
import { api, requiredServiceIds } from '../../api/mockApi';
import { Loader } from '../../components/Loader';

// Every customer visit starts here. The visit type decides which offers the
// technician must present before the visit can close.
export const StartVisitScreen = ({ user, onStarted }) => {
    const [checklists, setChecklists] = useState({});
    const [services, setServices] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [visitType, setVisitType] = useState('');
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        Promise.all([api.getVisitChecklists(), api.getServices()]).then(([c, s]) => {
            setChecklists(c.data);
            setServices(s.data);
        });
    }, []);

    const required = visitType ? requiredServiceIds(visitType) : [];
    const canStart = customerName.trim() && visitType;

    const handleStart = async (e) => {
        e.preventDefault();
        if (!canStart) return;
        setStarting(true);
        const { data } = await api.startVisit({ technician_id: user.id, customer_name: customerName.trim(), address: address.trim(), visit_type: visitType });
        onStarted(data);
    };

    return (
        <div className="p-4 sm:p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Start a visit</h1>
            <p className="text-gray-500 mt-1">The visit closes only after every required offer has the customer's decision.</p>
            <form onSubmit={handleStart} className="bg-white rounded-2xl shadow p-6 mt-4 space-y-4">
                <div>
                    <label htmlFor="visit_customer" className="block text-sm font-medium text-gray-600 mb-1">Customer name *</label>
                    <input id="visit_customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-100" placeholder="e.g. Williams Residence" />
                </div>
                <div>
                    <label htmlFor="visit_address" className="block text-sm font-medium text-gray-600 mb-1">Service address</label>
                    <input id="visit_address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-100" placeholder="Street, city" />
                </div>
                <div>
                    <label htmlFor="visit_type" className="block text-sm font-medium text-gray-600 mb-1">Visit type *</label>
                    <select id="visit_type" value={visitType} onChange={(e) => setVisitType(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-100">
                        <option value="">Select visit type...</option>
                        {Object.keys(checklists).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                {required.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-amber-900">Required offers on this visit ({required.length})</p>
                        <ul className="mt-1 text-sm text-amber-900 list-disc list-inside">
                            {required.map(id => <li key={id}>{services.find(s => s.id === id)?.name || id}</li>)}
                        </ul>
                    </div>
                )}
                <button type="submit" disabled={!canStart || starting} className="w-full bg-[#004B87] hover:bg-blue-800 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center h-12">
                    {starting ? <Loader small={true} /> : 'Start visit'}
                </button>
            </form>
        </div>
    );
};

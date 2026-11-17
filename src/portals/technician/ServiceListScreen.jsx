import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { CheckIcon, ChevronRightIcon, XIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';

const OUTCOME_CHIP = {
    approved: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-700',
};

// The gate: required offers for this visit, and a Close button that stays
// locked until every one has the customer's decision.
const VisitPanel = ({ visit, progress, services, approvedCount, onSelectService, onClose, onOpenOrder, closing }) => {
    const remaining = progress.requiredCount - progress.askedCount;
    const pct = progress.requiredCount ? Math.round((progress.askedCount / progress.requiredCount) * 100) : 100;
    return (
        <div className="mx-4 sm:mx-6 mt-4 bg-white border-2 border-[#004B87] rounded-2xl p-4">
            <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current visit</p>
                    <h2 className="text-lg font-bold text-gray-900">{visit.customer_name} · {visit.visit_type}</h2>
                    {visit.address && <p className="text-sm text-gray-500">{visit.address}</p>}
                </div>
                <p className="text-sm font-semibold text-gray-700 tabular-nums">{progress.askedCount} of {progress.requiredCount} required offers asked</p>
            </div>
            <div className="h-3 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${progress.canClose ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
            </div>
            <ul className="mt-3 space-y-2">
                {progress.required.map(r => {
                    const svc = services.find(s => s.id === r.service_id);
                    return (
                        <li key={r.service_id} className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                            <span className="font-medium text-gray-800 text-sm">{r.name}</span>
                            {r.outcome ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${OUTCOME_CHIP[r.outcome]}`}>{r.outcome}</span>
                            ) : (
                                svc && <button onClick={() => onSelectService(svc)} className="text-sm font-semibold text-white bg-[#004B87] hover:bg-blue-800 px-3 py-1 rounded-lg" data-help={`Opens ${r.name} so you can read the script and show it to the customer.`}>Present now</button>
                            )}
                        </li>
                    );
                })}
            </ul>
            <button
                onClick={approvedCount > 0 ? onOpenOrder : onClose}
                disabled={!progress.canClose || closing}
                className="w-full mt-4 font-bold py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                data-help={!progress.canClose
                    ? 'Locked until each required offer has the customer\'s decision.'
                    : approvedCount > 0 ? 'Opens the order form for the approved offers; the visit closes after the order.' : 'Closes this visit and records it.'}
            >
                {!progress.canClose
                    ? `Locked: present ${remaining} more required offer${remaining === 1 ? '' : 's'} to close`
                    : approvedCount > 0 ? 'Create order and close visit' : 'Close visit'}
            </button>
        </div>
    );
};

export const ServiceListScreen = ({ onSelectService, approvedItems = [], onOpenOrder, onRemoveItem, visit, progress, onCloseVisit, closing }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seasonalConfig, setSeasonalConfig] = useState({});
    const [streak, setStreak] = useState(null);
    const [showChecklist, setShowChecklist] = useState(false);
    const [visitType, setVisitType] = useState('');
    const [checklists, setChecklists] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([
            api.getServices(),
            api.getSeasonalConfig(),
            api.getVisitChecklists(),
            api.getTechnicianStreak(user.id),
        ]).then(([servicesRes, seasonalRes, checklistsRes, streakRes]) => {
            setServices(servicesRes.data.filter(s => s.is_active !== false));
            setSeasonalConfig(seasonalRes.data);
            setChecklists(checklistsRes.data);
            setStreak(streakRes.data);
            setLoading(false);
        });
    }, [user.id]);

    if (loading) return <div className="flex justify-center p-8"><Loader /></div>;

    const currentMonth = new Date().getMonth() + 1;
    const approvedIds = approvedItems.map(item => item.service_id);
    const visitTypes = Object.keys(checklists);

    const groupedServices = services.reduce((acc, service) => {
        (acc[service.type] = acc[service.type] || []).push(service);
        return acc;
    }, {});
    Object.keys(groupedServices).forEach(type => {
        groupedServices[type].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));
    });
    const serviceTypes = ['HVAC', 'Plumbing', 'Energy'];
    const cartTotal = approvedItems.reduce((sum, item) => sum + item.price, 0);
    const selectedChecklist = checklists[visitType] || [];

    return (
        <div>
            <div className="p-4 sm:p-6 bg-gray-50">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Multi-Service Upselling Assistant</h1>
                        <p className="text-gray-500 mt-1">Select a service to present to the customer.</p>
                    </div>
                    {/* Streak Counter */}
                    {streak && streak.streak > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                            <p className="text-2xl font-bold text-amber-600">{streak.streak}</p>
                            <p className="text-xs text-amber-700 font-medium">Visit Streak</p>
                        </div>
                    )}
                </div>
            </div>

            {visit && progress ? (
                <VisitPanel
                    visit={visit}
                    progress={progress}
                    services={services}
                    approvedCount={approvedItems.length}
                    onSelectService={onSelectService}
                    onClose={onCloseVisit}
                    onOpenOrder={onOpenOrder}
                    closing={closing}
                />
            ) : (
            /* What to Look For Checklist */
            <div className="mx-4 sm:mx-6 mt-4">
                <button
                    onClick={() => setShowChecklist(!showChecklist)}
                    className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-left hover:bg-indigo-100 transition-colors"
                    data-help="Shows or hides the list of things to check on this kind of visit."
                >
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-indigo-800 text-sm">What to Look For Checklist</span>
                        <span className="text-indigo-600 text-xs">{showChecklist ? 'Hide' : 'Show'}</span>
                    </div>
                </button>

                {showChecklist && (
                    <div className="bg-white border border-indigo-200 border-t-0 rounded-b-xl p-4 -mt-1">
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">What type of visit is this?</label>
                            <select
                                value={visitType}
                                onChange={(e) => setVisitType(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-gray-100 text-sm"
                                data-help="Pick the visit type to see what to look for and which offer each finding leads to."
                            >
                                <option value="">Select visit type...</option>
                                {visitTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        {selectedChecklist.length > 0 && (
                            <div className="space-y-2">
                                {selectedChecklist.map((item, idx) => {
                                    const svc = services.find(s => s.id === item.leads_to);
                                    const isInCart = approvedIds.includes(item.leads_to);
                                    return (
                                        <div key={idx} className={`flex items-start gap-3 p-2 rounded-lg text-sm ${isInCart ? 'bg-green-50' : 'bg-gray-50'}`}>
                                            <span className={`mt-0.5 flex-shrink-0 ${isInCart ? 'text-green-500' : 'text-gray-400'}`}>
                                                <CheckIcon />
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{item.check}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">{item.trigger}</p>
                                                {svc && !isInCart && (
                                                    <button
                                                        onClick={() => onSelectService(svc)}
                                                        className="text-blue-600 text-xs font-semibold mt-1 hover:underline"
                                                        data-help={`Opens ${svc.name} to present to the customer.`}
                                                    >
                                                        Present: {svc.name} ({svc.price_range}) &rarr;
                                                    </button>
                                                )}
                                                {isInCart && (
                                                    <p className="text-green-600 text-xs font-semibold mt-1">Already in order</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
            )}

            {/* Order Cart Banner */}
            {approvedItems.length > 0 && (
                <div className="mx-4 sm:mx-6 mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-green-800">
                            Approved Services ({approvedItems.length})
                        </h3>
                        <span className="text-lg font-bold text-green-700">${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                        {approvedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500"><CheckIcon /></span>
                                    <span className="font-medium text-gray-800 text-sm">{item.service_name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-600">${item.price}</span>
                                    <button onClick={() => onRemoveItem(idx)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Remove ${item.service_name}`} data-help={`Takes ${item.service_name} out of the order.`}>
                                        <XIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onOpenOrder}
                        disabled={visit && progress && !progress.canClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-base transition-colors disabled:bg-gray-300 disabled:text-gray-600"
                        data-help={visit && progress && !progress.canClose
                            ? 'Locked until each required offer has the customer\'s decision.'
                            : 'Opens the order form for the approved services, for the customer to sign.'}
                    >
                        {visit && progress && !progress.canClose
                            ? 'Present every required offer before the order'
                            : `Create Binding Order (${approvedItems.length} item${approvedItems.length > 1 ? 's' : ''})`}
                    </button>
                </div>
            )}

            <div className="p-4 sm:p-6 space-y-8">
                {serviceTypes.map(type => groupedServices[type] && (
                    <div key={type}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2 border-gray-200">{type} Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedServices[type].map(service => {
                                const isApproved = approvedIds.includes(service.id);
                                const seasonal = seasonalConfig[service.id];
                                const isSeasonal = seasonal && seasonal.months.includes(currentMonth) && seasonal.label;
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => !isApproved && onSelectService(service)}
                                        disabled={isApproved}
                                        data-help={isApproved ? `${service.name} is already in the order.` : `Opens ${service.name}: price, benefits, video and your script.`}
                                        className={`p-6 rounded-2xl shadow-md text-left flex flex-col h-full transition-all ${
                                            isApproved
                                                ? 'bg-green-50 border-2 border-green-300 cursor-default'
                                                : 'bg-white hover:shadow-xl hover:-translate-y-1'
                                        }`}
                                    >
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                                                <p className="text-base font-semibold text-blue-600 bg-blue-100 py-1 px-3 rounded-full whitespace-nowrap">{service.price_range}</p>
                                            </div>
                                            {isSeasonal && (
                                                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                                                    {seasonal.label}
                                                </span>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1 mb-4">Context: {service.offer_context}</p>
                                            <ul className="space-y-2">
                                                {JSON.parse(service.benefits).map((benefit, index) => (
                                                    <li key={index} className="flex items-start text-sm">
                                                        <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0"><CheckIcon /></span>
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex justify-end items-center mt-6 font-semibold">
                                            {isApproved ? (
                                                <span className="text-green-600 flex items-center gap-1">
                                                    <CheckIcon /> Added to Order
                                                </span>
                                            ) : (
                                                <span className="text-blue-600 flex items-center">View Offer <ChevronRightIcon /></span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { useAuth } from '../../context/AuthContext';
import { CheckIcon } from '../../components/Icons';
import { SuccessScreen } from '../../components/SuccessScreen';
import { CustomerDecisionScreen } from './CustomerDecisionScreen';

const TechnicianDetailScreen = ({ service, onBack, onPresent, videos = [] }) => (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <button onClick={onBack} className="text-blue-600 font-semibold mb-4 inline-flex items-center" data-help="Goes back to the visit and the service list without recording a decision.">&larr; Back to Services</button>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
                <p className="text-lg font-bold text-blue-600">{service.price_range}</p>
            </div>
            <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Customer Benefits:</h3>
                <ul className="space-y-2">
                    {JSON.parse(service.benefits).map((benefit, index) => (
                        <li key={index} className="flex items-start text-base">
                            <span className="text-green-500 mr-3 mt-1 flex-shrink-0"><CheckIcon /></span>
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {videos.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Show the customer: {videos[0].title}</h3>
                    <video src={videos[0].video_url} controls playsInline className="w-full rounded-xl bg-black aspect-video" />
                </div>
            )}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
                <h3 className="font-bold text-yellow-800">Your Script:</h3>
                <p className="text-yellow-900 italic mt-1">"{service.script}"</p>
            </div>
            <button onClick={onPresent} className="w-full bg-[#004B87] hover:bg-blue-800 text-white font-bold py-4 px-4 rounded-lg text-lg" data-help="Opens the customer's screen, where the customer approves or declines this offer.">
                Present to Customer
            </button>
        </div>
    </div>
);

// Follow-up prompt shown after a decline
const FollowUpPrompt = ({ service, defaultAddress, onFollowUp, onSkip }) => {
    const [address, setAddress] = useState(defaultAddress);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Schedule Follow-Up?</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Tag this address for a 30-day follow-up on <strong>{service.name}</strong>.
                </p>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-4"
                    placeholder="Customer address..."
                    data-help="The address to follow up at. Change it if the customer gave a different one."
                />
                <div className="flex gap-3">
                    <button onClick={onSkip} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg" data-help="Records the decline without a follow-up and goes back to the visit.">
                        Skip
                    </button>
                    <button
                        onClick={() => onFollowUp(address)}
                        disabled={!address.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-300"
                        data-help="Tags this address for a follow-up on this offer in 30 days. Your admin sees it under Follow-Ups."
                    >
                        Set Follow-Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ServiceDetailContainer = ({ service, visit, onBack, onApproved, onDeclined }) => {
    const [view, setView] = useState('detail');
    const [lastDeclineReason, setLastDeclineReason] = useState('');
    const [videos, setVideos] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        api.getReadyVideosForService(service.id).then(({ data }) => setVideos(data || []));
    }, [service.id]);

    const handlePresentToCustomer = () => setView('customer');

    const handleCustomerDecision = async (decision, declineReason, customerInitials) => {
        await api.logOfferDecision({
            technician_id: user.id,
            service_id: service.id,
            visit_id: visit?.id,
            outcome: decision,
            revenue: 0,
            decline_reason: declineReason,
            customer_initials: customerInitials,
            address: visit?.address || undefined,
        });
        if (decision === 'approved') {
            setView('approved_success');
            setTimeout(() => onApproved(service), 1500);
        } else {
            setLastDeclineReason(declineReason);
            setView('follow_up_prompt');
        }
    };

    const handleFollowUp = async (address) => {
        await api.createFollowUp({
            address: address || visit?.address,
            service_id: service.id,
            service_name: service.name,
            technician_id: user.id,
            decline_reason: lastDeclineReason,
        });
        setView('declined_success');
        setTimeout(() => onDeclined(), 1500);
    };

    const handleSkipFollowUp = () => {
        setView('declined_success');
        setTimeout(() => onDeclined(), 1500);
    };

    if (view === 'customer') return <CustomerDecisionScreen service={service} onDecision={handleCustomerDecision} />;
    if (view === 'follow_up_prompt') return <FollowUpPrompt service={service} defaultAddress={visit?.address || ''} onFollowUp={handleFollowUp} onSkip={handleSkipFollowUp} />;
    if (view === 'approved_success') return <SuccessScreen title="Service Approved!" message="Added to the order. You can present more services or create the binding order." />;
    if (view === 'declined_success') return <SuccessScreen title="Decision Recorded" message="The customer's choice has been logged." isDecline={true} />;
    return <TechnicianDetailScreen service={service} videos={videos} onBack={onBack} onPresent={handlePresentToCustomer} />;
};

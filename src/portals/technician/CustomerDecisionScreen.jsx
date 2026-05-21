import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { CheckIcon, XIcon } from '../../components/Icons';

export const CustomerDecisionScreen = ({ service, onDecision }) => {
    const [loading, setLoading] = useState(null);
    const [showDeclineReason, setShowDeclineReason] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [reasons, setReasons] = useState([]);

    useEffect(() => {
        api.getDeclineReasons().then(({ data }) => setReasons(data));
    }, []);

    const handleApprove = async () => {
        setLoading('approved');
        await onDecision('approved');
    };

    const handleDeclineClick = () => {
        setShowDeclineReason(true);
    };

    const handleConfirmDecline = async () => {
        setLoading('declined');
        await onDecision('declined', declineReason || 'no_interest');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                {!showDeclineReason ? (
                    <>
                        <p className="text-gray-600 mb-2">Please confirm your choice for the following offer:</p>
                        <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                        <p className="text-2xl font-semibold text-blue-600 my-4">{service.price_range}</p>
                        <ul className="space-y-2 text-left my-6">
                            {JSON.parse(service.benefits).map((benefit, index) => (
                                <li key={index} className="flex items-start text-base">
                                    <span className="text-green-500 mr-3 mt-1 flex-shrink-0"><CheckIcon /></span>
                                    <span className="text-gray-700">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={handleDeclineClick} disabled={!!loading} className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-4 rounded-lg text-lg disabled:opacity-50">
                                <XIcon /><span className="ml-2">Decline</span>
                            </button>
                            <button onClick={handleApprove} disabled={!!loading} className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg text-lg disabled:opacity-50">
                                {loading === 'approved' ? <Loader small={true} /> : <><CheckIcon /><span className="ml-2">Approve</span></>}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Reason for Declining?</h2>
                        <p className="text-gray-500 text-sm mb-4">This helps us improve our offerings.</p>
                        <div className="space-y-2 text-left mb-6">
                            {reasons.map(reason => (
                                <label key={reason.value} className={`flex items-center p-3 rounded-lg cursor-pointer border transition-colors ${declineReason === reason.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="decline_reason"
                                        value={reason.value}
                                        checked={declineReason === reason.value}
                                        onChange={(e) => setDeclineReason(e.target.value)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-3 text-gray-700">{reason.label}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleConfirmDecline}
                            disabled={!!loading}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading === 'declined' ? <Loader small={true} /> : 'Confirm Decline'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

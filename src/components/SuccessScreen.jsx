import React from 'react';
import { CheckIcon, XIcon } from './Icons';

export const SuccessScreen = ({ title, message, isDecline = false }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${isDecline ? 'bg-gray-200' : 'bg-green-100'}`}>
                {isDecline ? <XIcon /> : <CheckIcon />}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-600">{message}</p>
        </div>
    </div>
);

import React from 'react';

export const Loader = ({ small = false }) => (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${small ? 'h-5 w-5' : 'h-12 w-12'}`}></div>
);

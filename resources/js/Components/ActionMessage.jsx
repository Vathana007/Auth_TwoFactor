import React from 'react';

export default function ActionMessage({ on, children }) {
    return (
        <div>
            <div
                className={`text-sm text-gray-600 transition-opacity duration-1000 ease-in ${on ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {children}
            </div>
        </div>
    );
}
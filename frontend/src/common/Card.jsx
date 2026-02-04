import React from 'react';

export default function Card({ children, className = "", onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl ${onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''
                } ${className}`}
        >
            {children}
        </div>
    );
}

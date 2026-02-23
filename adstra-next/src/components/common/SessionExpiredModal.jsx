import React from 'react';

const SessionExpiredModal = ({ onLogin }) => {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">

                {/* Header with Icon */}
                <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100">
                    <div className="bg-red-100 p-3 rounded-full mb-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-800">Session Expired</h3>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <p className="text-slate-600 mb-6">
                        Your security session has timed out due to inactivity.
                        Please log in again to continue managing the dashboard.
                    </p>

                    <button
                        onClick={onLogin}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Login Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;

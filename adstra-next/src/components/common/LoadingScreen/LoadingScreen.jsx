"use client";

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("INITIALIZING...");
    const [visibleParts, setVisibleParts] = useState([]);

    const messages = ["CONNECTING...", "LOADING ASSETS...", "PREPARING INTERFACE...", "WELCOME"];

    useEffect(() => {
        // Animate Logo Parts Assembly
        const partsCount = 5;
        const timeouts = [];

        for (let i = 0; i < partsCount; i++) {
            const timeout = setTimeout(() => {
                setVisibleParts((prev) => [...prev, i]);
            }, 300 + (i * 150));
            timeouts.push(timeout);
        }

        // Simulate Loading Process
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                const increment = Math.random() * 4;
                const nextProgress = prevProgress + increment;

                if (nextProgress >= 100) {
                    clearInterval(interval);
                    setLoadingText("COMPLETE");

                    // Signal completion after a small delay to let the user see the 100% state
                    if (onComplete) {
                        setTimeout(() => {
                            onComplete();
                        }, 500);
                    }

                    return 100;
                }

                if (nextProgress < 30) setLoadingText(messages[0]);
                else if (nextProgress < 60) setLoadingText(messages[1]);
                else if (nextProgress < 90) setLoadingText(messages[2]);
                else setLoadingText(messages[3]);

                return nextProgress;
            });
        }, 50);

        return () => {
            timeouts.forEach(clearTimeout);
            clearInterval(interval);
        };
    }, [onComplete]);

    const isVisible = (index) => visibleParts.includes(index);

    return (
        <div className="fixed inset-0 z-[9999] h-screen w-screen flex flex-col justify-center items-center bg-slate-50 overflow-hidden font-['Montserrat',sans-serif]">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-20 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center p-8">

                {/* SVG Logo Construction */}
                <div className="w-64 h-64 md:w-80 md:h-80 relative mb-8">
                    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                        <defs>
                            <path id="pathAdstra" d="M 40,200 A 152,152 0 0,1 360,200" />
                            <path id="pathDigital" d="M 70,200 A 112,112 0 0,1 330,200" />
                            <path id="pathBottom" d="M 35,200 A 165,165 0 0,0 365,200" />
                        </defs>

                        {/* Outer Ring */}
                        <circle cx="200" cy="200" r="190" stroke="#2F4858" strokeWidth="6" fill="white" className="logo-circle-ring" />

                        {/* Inner Geometric Shapes (3 Layer Diagonal Pattern) */}
                        <g transform="translate(200, 200)">
                            <g transform="rotate(-45)">
                                {/* ROW 1 (Top Strip) */}
                                <path
                                    id="part-navy"
                                    d="M-62.5 -72.5 L30 -72.5 L30 -27.5 L-72.5 -27.5 L-72.5 -62.5 Q-72.5 -72.5 -62.5 -72.5 Z"
                                    fill="#0B2545"
                                    className={`logo-part ${isVisible(0) ? 'visible' : ''}`}
                                    style={{ transform: isVisible(0) ? 'translate(0, 0)' : 'translate(-50px, -50px)' }}
                                />

                                <path
                                    id="part-royal"
                                    d="M35 -72.5 L62.5 -72.5 Q72.5 -72.5 72.5 -62.5 L72.5 -27.5 L35 -27.5 Z"
                                    fill="#0056D2"
                                    className={`logo-part ${isVisible(1) ? 'visible' : ''}`}
                                    style={{ transform: isVisible(1) ? 'translate(0, 0)' : 'translate(50px, -50px)' }}
                                />

                                {/* ROW 2 (Middle Strip) */}
                                <rect
                                    id="part-teal"
                                    x="-72.5" y="-22.5" width="107.5" height="45" fill="#1CA3C4"
                                    className={`logo-part ${isVisible(2) ? 'visible' : ''}`}
                                    style={{ transform: isVisible(2) ? 'translate(0, 0)' : 'translate(-50px, 50px)' }}
                                />

                                <rect
                                    id="part-grey"
                                    x="40" y="-22.5" width="32.5" height="45" fill="#666666"
                                    className={`logo-part ${isVisible(3) ? 'visible' : ''}`}
                                    style={{ transform: isVisible(3) ? 'translate(0, 0)' : 'translate(50px, -50px)' }}
                                />

                                {/* ROW 3 (Bottom Strip) */}
                                <path
                                    id="part-orange"
                                    d="M-62.5 27.5 L62.5 27.5 Q72.5 27.5 72.5 37.5 L72.5 72.5 L-72.5 72.5 L-72.5 37.5 Q-72.5 27.5 -62.5 27.5 Z"
                                    fill="#D47A1F"
                                    className={`logo-part ${isVisible(4) ? 'visible' : ''}`}
                                    style={{ transform: isVisible(4) ? 'translate(0, 0)' : 'translate(50px, 50px)' }}
                                />
                            </g>
                        </g>

                        {/* Dots on the ring */}
                        <circle cx="45" cy="180" r="5" fill="#6ba798" className="brand-text" />
                        <circle cx="355" cy="180" r="5" fill="#6ba798" className="brand-text" />

                        {/* Text Elements */}
                        <text className="brand-text" fontFamily="Montserrat" fontWeight="600" fontSize="28" fill="#2F4858" letterSpacing="6">
                            <textPath href="#pathAdstra" startOffset="50%" textAnchor="middle">
                                ADSTRA
                            </textPath>
                        </text>

                        <text className="brand-text" fontFamily="Montserrat" fontWeight="400" fontSize="24" fill="#2F4858" letterSpacing="6">
                            <textPath href="#pathDigital" startOffset="50%" textAnchor="middle">
                                DIGITAL
                            </textPath>
                        </text>

                        <text className="brand-text" fontFamily="Montserrat" fontWeight="600" fontSize="18" fill="#2F4858" letterSpacing="3">
                            <textPath href="#pathBottom" startOffset="50%" textAnchor="middle">
                                PREMIUM DIGITAL MARKETING
                            </textPath>
                        </text>

                        <text x="200" y="312" textAnchor="middle" fontSize="9" fill="#7B7B7B" fontWeight="600" letterSpacing="1" className="brand-text">
                            ISO + IAF certified
                        </text>
                    </svg>
                </div>

                {/* Loading Indicator */}
                <div className="loading-container w-64 md:w-80 flex flex-col items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                            className="progress-bar-fill h-2 rounded-full transition-all duration-300 ease-out relative"
                            style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, #0B2545, #1CA3C4, #D47A1F)'
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between w-full text-xs font-semibold text-slate-500 tracking-wider">
                        <span className={progress === 100 ? "text-teal-600" : ""}>{loadingText}</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoadingScreen;

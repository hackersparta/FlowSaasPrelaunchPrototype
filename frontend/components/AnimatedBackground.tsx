"use client";

import React from 'react';

const AnimatedBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#FDF8F5]">
            {/* Subtle warm gradient orb - Top Left */}
            <div
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px]"
                style={{
                    background: 'radial-gradient(circle, #FFDCC2 0%, rgba(255, 255, 255, 0) 70%)'
                }}
            />

            {/* Subtle warm gradient orb - Bottom Right */}
            <div
                className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px]"
                style={{
                    background: 'radial-gradient(circle, #FFE4D6 0%, rgba(255, 255, 255, 0) 70%)'
                }}
            />
        </div>
    );
};

export default AnimatedBackground;

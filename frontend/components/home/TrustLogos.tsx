"use client";

import React from 'react';
import Image from 'next/image';

const TrustLogos = () => {
    const logos = [
        { name: 'Microsoft', src: '/logos/microsoft.png' },
        { name: 'Google', src: '/logos/google.png' },
        { name: 'Amazon', src: '/logos/amazon.png' },
        { name: 'Meta', src: '/logos/meta.png' },
        { name: 'Apple', src: '/logos/apple.png' },
        { name: 'Netflix', src: '/logos/netflix.png' },
        { name: 'Salesforce', src: '/logos/salesforce.png' },
        { name: 'IBM', src: '/logos/ibm.png' },
        { name: 'Adobe', src: '/logos/adobe.png' },
        { name: 'Slack', src: '/logos/slack.png' },
        { name: 'Spotify', src: '/logos/spotify.png' },
        { name: 'Zoom', src: '/logos/zoom.png' },
        { name: 'Oracle', src: '/logos/oracle.png' },
        { name: 'Intel', src: '/logos/intel.png' },
    ];

    return (
        <section className="py-16 bg-slate-50 border-y border-slate-200 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <p className="text-center text-sm text-slate-500 font-semibold uppercase tracking-wider mb-10">
                    Trusted by teams at leading companies
                </p>

                {/* Infinite scroll container */}
                <div className="relative">
                    <div className="flex animate-scroll hover:pause">
                        {/* First set of logos */}
                        <div className="flex items-center gap-20 px-10">
                            {logos.map((logo, index) => (
                                <div key={`first-${index}`} className="flex-shrink-0">
                                    <Image
                                        src={logo.src}
                                        alt={logo.name}
                                        width={160}
                                        height={48}
                                        className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Duplicate set for seamless loop */}
                        <div className="flex items-center gap-20 px-10">
                            {logos.map((logo, index) => (
                                <div key={`second-${index}`} className="flex-shrink-0">
                                    <Image
                                        src={logo.src}
                                        alt={logo.name}
                                        width={160}
                                        height={48}
                                        className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustLogos;

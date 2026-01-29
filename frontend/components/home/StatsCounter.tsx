"use client";

import React, { useEffect, useState } from 'react';

const StatsCounter = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [counts, setCounts] = useState({
        workflows: 0,
        tools: 0,
        timeSaved: 0,
        users: 0
    });

    const finalCounts = {
        workflows: 500,
        tools: 100,
        timeSaved: 50000,
        users: 10000
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        const element = document.getElementById('stats-counter');
        if (element) observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        const intervals = Object.keys(finalCounts).map((key) => {
            const finalValue = finalCounts[key as keyof typeof finalCounts];
            const increment = finalValue / steps;
            let currentStep = 0;

            return setInterval(() => {
                currentStep++;
                if (currentStep <= steps) {
                    setCounts((prev) => ({
                        ...prev,
                        [key]: Math.floor(increment * currentStep)
                    }));
                }
            }, stepDuration);
        });

        return () => intervals.forEach(clearInterval);
    }, [isVisible]);

    const stats = [
        {
            value: counts.workflows,
            suffix: '+',
            label: 'Workflow Templates',
            gradient: 'from-orange-500 to-orange-600'
        },
        {
            value: counts.tools,
            suffix: '+',
            label: 'Free Tools',
            gradient: 'from-red-500 to-red-600'
        },
        {
            value: counts.timeSaved,
            suffix: '+',
            label: 'Hours Saved',
            gradient: 'from-yellow-500 to-yellow-600'
        },
        {
            value: counts.users,
            suffix: '+',
            label: 'Happy Users',
            gradient: 'from-orange-600 to-red-600'
        }
    ];

    return (
        <section id="stats-counter" className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Trusted by thousands worldwide
                    </h2>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Join a growing community of professionals automating their workflows
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="relative group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                                {/* Content */}
                                <div className="relative z-10 text-center">
                                    <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                                        {stat.value.toLocaleString()}{stat.suffix}
                                    </div>
                                    <div className="text-slate-300 font-medium">
                                        {stat.label}
                                    </div>
                                </div>

                                {/* Decorative Corner */}
                                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-20 blur-2xl rounded-full transform translate-x-1/2 -translate-y-1/2`}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Text */}
                <div className="text-center mt-16">
                    <p className="text-slate-400 text-lg">
                        Automating workflows since 2024 • Saving time, one workflow at a time
                    </p>
                </div>
            </div>
        </section>
    );
};

export default StatsCounter;

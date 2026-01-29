"use client";

import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
    title: string;
    description: string;
    features: string[];
}

const tabs: Tab[] = [
    {
        id: 'workflows',
        label: 'AI Workflows',
        title: 'Automate Complex Tasks with AI',
        description: 'Build sophisticated automation workflows using our visual editor powered by n8n. Connect multiple apps and let AI handle the heavy lifting.',
        features: [
            'Visual workflow builder',
            'AI-powered automation',
            'Multi-step workflows',
            '100+ app integrations'
        ]
    },
    {
        id: 'tools',
        label: 'Free Tools',
        title: '100+ Developer Tools',
        description: 'Access our comprehensive suite of free online tools for formatting, converting, and generating data. No sign-up required.',
        features: [
            'JSON/XML formatters',
            'Code generators',
            'Data converters',
            'Text utilities'
        ]
    },
    {
        id: 'templates',
        label: 'Templates',
        title: 'Pre-built Templates',
        description: 'Start fast with ready-to-use workflow templates. Customize them to fit your exact needs in minutes.',
        features: [
            'Marketing automation',
            'Sales workflows',
            'IT operations',
            'HR processes'
        ]
    },
    {
        id: 'integrations',
        label: 'Integrations',
        title: 'Connect Everything',
        description: 'Seamlessly integrate with your favorite apps and services. From Slack to Salesforce, we\'ve got you covered.',
        features: [
            'Slack, Teams, Discord',
            'Gmail, Outlook',
            'Salesforce, HubSpot',
            'GitHub, GitLab'
        ]
    }
];

const ProductShowcase = () => {
    const [activeTab, setActiveTab] = useState('workflows');
    const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
                        Everything you need to automate
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        A complete toolkit for building, deploying, and managing your automations
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
                            {currentTab.title}
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {currentTab.description}
                        </p>
                        <ul className="space-y-3">
                            {currentTab.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-slate-700 text-lg">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 rounded-2xl shadow-xl overflow-hidden border border-orange-100/50">
                            <div className="w-full h-full flex items-center justify-center p-8">
                                <div className="w-full h-full bg-white/60 backdrop-blur-md rounded-xl border border-white/50 shadow-lg flex items-center justify-center relative overflow-hidden group">

                                    {activeTab === 'workflows' && (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            {/* Animated Background Grid */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                                            {/* Workflow Diagram */}
                                            <div className="relative z-10 w-full max-w-sm">
                                                {/* Step 1 */}
                                                <div className="flex items-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                                                    <div className="w-14 h-14 rounded-xl bg-white shadow-lg border border-orange-100 flex items-center justify-center text-orange-600">
                                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 p-3 bg-white rounded-lg shadow-sm border border-slate-100 text-sm text-slate-600">
                                                        New active lead detected
                                                    </div>
                                                </div>

                                                {/* Connector Line */}
                                                <div className="absolute left-7 top-14 bottom-14 w-0.5 bg-orange-200">
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                                                </div>

                                                {/* Step 2 */}
                                                <div className="flex items-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg flex items-center justify-center text-white">
                                                        <svg className="w-7 h-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 p-3 bg-orange-50 rounded-lg shadow-sm border border-orange-100 text-sm text-slate-800 font-medium">
                                                        AI Enriches & Qualifies
                                                    </div>
                                                </div>

                                                {/* Step 3 */}
                                                <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                                    <div className="w-14 h-14 rounded-xl bg-white shadow-lg border border-green-100 flex items-center justify-center text-green-600">
                                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 p-3 bg-white rounded-lg shadow-sm border border-slate-100 text-sm text-slate-600">
                                                        Added to CRM & Slack
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'tools' && (
                                        <div className="grid grid-cols-2 gap-6 p-8 w-full max-w-sm">
                                            {[
                                                { label: 'JSON', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: '{}' },
                                                { label: 'XML', color: 'bg-green-50 text-green-600 border-green-100', icon: '</>' },
                                                { label: 'CSV', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: 'abc' },
                                                { label: 'SQL', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'db' }
                                            ].map((tool, i) => (
                                                <div
                                                    key={tool.label}
                                                    className={`aspect-square ${tool.color} border-2 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md`}
                                                    style={{ animation: `fade-in-up 0.5s ease-out ${i * 100}ms backwards` }}
                                                >
                                                    <span className="text-2xl font-bold font-mono">{tool.icon}</span>
                                                    <span className="text-xs font-bold uppercase tracking-wide">{tool.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'templates' && (
                                        <div className="w-full max-w-sm relative">
                                            {/* Stacked Cards Effect */}
                                            <div className="absolute top-0 inset-x-4 h-32 bg-slate-100 rounded-xl border border-slate-200 transform scale-90 -translate-y-4 opacity-50"></div>
                                            <div className="absolute top-2 inset-x-2 h-32 bg-slate-50 rounded-xl border border-slate-200 transform scale-95 -translate-y-2 opacity-75"></div>

                                            {/* Main Card */}
                                            <div className="relative bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
                                                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
                                                <div className="p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Active</div>
                                                        <div className="flex -space-x-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                                            <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                                                        </div>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 mb-2">Lead Scoring & Routing</h4>
                                                    <p className="text-xs text-slate-500 mb-4">Automatically score leads based on enrichment data and route high-value prospects.</p>
                                                    <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors">
                                                        Use Template
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'integrations' && (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            {/* Central Hub */}
                                            <div className="relative z-10 w-20 h-20 bg-white rounded-2xl shadow-xl border border-orange-100 flex items-center justify-center animate-pulse">
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Orbital Icons */}
                                            {[
                                                { bg: 'bg-[#611f69]', icon: 'S' }, // Slack
                                                { bg: 'bg-[#00a1e0]', icon: 'sf' }, // Salesforce
                                                { bg: 'bg-[#24292e]', icon: 'gh' }, // GitHub
                                                { bg: 'bg-[#ff7a59]', icon: 'hs' }, // HubSpot
                                                { bg: 'bg-[#4285f4]', icon: 'G' },  // Google
                                                { bg: 'bg-[#5865F2]', icon: 'D' },  // Discord
                                            ].map((app, i) => {
                                                const angle = (i * 60) * (Math.PI / 180);
                                                const radius = 100;
                                                const x = Math.cos(angle) * radius;
                                                const y = Math.sin(angle) * radius;

                                                return (
                                                    <div
                                                        key={i}
                                                        className="absolute w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-white font-bold text-xs transform hover:scale-110 transition-transform cursor-pointer"
                                                        style={{
                                                            transform: `translate(${x}px, ${y}px)`,
                                                            animation: `fade-in 0.5s ease-out ${i * 100}ms backwards`
                                                        }}
                                                    >
                                                        <span className={`w-8 h-8 rounded flex items-center justify-center uppercase ${app.bg}`}>
                                                            {app.icon}
                                                        </span>

                                                        {/* Connecting Line */}
                                                        <div
                                                            className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-200 to-red-200 h-0.5 w-[100px] origin-center opacity-30"
                                                            style={{
                                                                transform: `rotate(${angle * (180 / Math.PI) + 180}deg) translateX(50%)`,
                                                                left: '50%',
                                                                top: '50%'
                                                            }}
                                                        ></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-br from-red-600/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductShowcase;

"use client";

import React from 'react';



const BeforeAfterComparison = () => {
    return (
        <section className="py-24 bg-gradient-to-br from-slate-50 to-purple-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
                        From chaos to clarity
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        See how FlowSaaS transforms complex manual processes into simple automated workflows
                    </p>
                </div>

                {/* Comparison Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Before: Manual Process */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Manual Process</h3>
                                <p className="text-red-600 font-semibold">Slow & Error-Prone</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { step: 1, text: 'Check email for new leads', time: '10 min' },
                                { step: 2, text: 'Copy data to spreadsheet', time: '15 min' },
                                { step: 3, text: 'Update CRM manually', time: '20 min' },
                                { step: 4, text: 'Send welcome email', time: '10 min' },
                                { step: 5, text: 'Notify sales team on Slack', time: '5 min' },
                                { step: 6, text: 'Create follow-up task', time: '10 min' }
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                    <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 text-red-700 font-bold text-sm">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-700 font-medium">{item.text}</p>
                                        <p className="text-sm text-amber-800">Hidden Costs: IT setup, maintenance, security patching require ~5hrs/week across teams</p>
                                        <p className="text-sm text-red-600 font-semibold">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">Total Time:</span>
                                <span className="text-2xl font-bold text-red-600">70 min/lead</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">High risk of human error • Repetitive • Boring</p>
                        </div>

                        {/* Hidden Costs Badge (To balance layout) */}
                        <div className="mt-6 text-center p-4 bg-red-50 rounded-xl text-slate-700 border border-red-100">
                            <p className="text-sm font-semibold mb-1">Annual Cost Per Employee</p>
                            <p className="text-3xl font-bold text-red-600">$5,400+</p>
                            <p className="text-sm text-slate-500 mt-1">Wasted on repetitive data entry</p>
                        </div>
                    </div>

                    {/* After: With FlowSaaS */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-200 relative overflow-hidden">
                        {/* Success Glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400 to-blue-400 opacity-20 blur-3xl"></div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">With FlowSaaS</h3>
                                <p className="text-green-600 font-semibold">Fast & Reliable</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {[
                                { step: 1, text: 'New lead arrives via email', auto: true },
                                { step: 2, text: 'Auto-extract & validate data', auto: true },
                                { step: 3, text: 'Create CRM contact + update spreadsheet', auto: true },
                                { step: 4, text: 'Send personalized welcome email', auto: true },
                                { step: 5, text: 'Notify sales team + create task', auto: true },
                                { step: 6, text: 'Update analytics in real-time', auto: true }
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-700 font-medium">{item.text}</p>
                                        {item.auto && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-xs text-green-600 font-semibold">Automated</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200 relative z-10">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">Total Time:</span>
                                <span className="text-2xl font-bold text-green-600">~30 seconds</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">Zero errors • Consistent • Scalable</p>
                        </div>

                        {/* Savings Badge */}
                        <div className="mt-6 text-center p-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-white relative z-10">
                            <p className="text-sm font-semibold mb-1">Time Saved Per Lead</p>
                            <p className="text-3xl font-bold">99.2%</p>
                            <p className="text-sm opacity-90 mt-1">That's 69+ minutes back in your day!</p>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <p className="text-lg text-slate-600 mb-4">
                        Ready to transform your workflows?
                    </p>
                    <div className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg hover:gap-3 transition-all cursor-pointer">
                        See more examples
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BeforeAfterComparison;

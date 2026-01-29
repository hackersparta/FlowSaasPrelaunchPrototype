"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    tool_type: string;
    is_active: boolean;
    category: string;
}

interface ToolsShowcaseProps {
    tools: Tool[];
}

const ToolsShowcase: React.FC<ToolsShowcaseProps> = ({ tools }) => {
    const router = useRouter();

    const categories = [
        { name: 'Converters', icon: '🔄', color: 'from-orange-500 to-red-500' },
        { name: 'Generators', icon: '⚡', color: 'from-orange-600 to-red-600' },
        { name: 'Formatters', icon: '✨', color: 'from-red-500 to-orange-500' },
        { name: 'Validators', icon: '✓', color: 'from-orange-500 to-red-500' },
        { name: 'Encoders', icon: '🔐', color: 'from-red-600 to-orange-600' },
        { name: 'Utilities', icon: '🛠️', color: 'from-orange-600 to-red-500' }
    ];

    const displayTools = tools.slice(0, 12);

    return (
        <section className="py-24 bg-gradient-to-br from-white via-orange-50 to-red-50">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm mb-6">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        100% Free • No Sign-up Required
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
                        Free developer tools
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Access our complete suite of online tools for formatting, converting, and generating data
                    </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className="group cursor-pointer"
                        >
                            <div className={`px-6 py-3 bg-gradient-to-r ${category.color} rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2`}>
                                <span className="text-xl">{category.icon}</span>
                                <span>{category.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                    {displayTools.map((tool, index) => (
                        <div
                            key={tool.id}
                            onClick={() => router.push(`/tools/${tool.slug}`)}
                            className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                            </div>

                            {/* Tool Name */}
                            <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                {tool.name}
                            </h3>

                            {/* Category Badge */}
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                                {tool.category}
                            </span>

                            {/* Hover Arrow */}
                            <div className="mt-4 flex items-center text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-sm font-semibold">Try now</span>
                                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center">
                    <button
                        onClick={() => router.push('/tools')}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50"
                    >
                        View all {tools.length} free tools
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ToolsShowcase;

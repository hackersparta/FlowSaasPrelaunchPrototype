"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface WorkflowTemplate {
    id: number;
    name: string;
    description: string;
    n8n_workflow_id: string;
    is_active: boolean;
    is_free: boolean;
    credits_per_run: number;
    category: string;
    created_at: string;
}

interface WorkflowCarouselProps {
    templates: WorkflowTemplate[];
}

const WorkflowCarousel: React.FC<WorkflowCarouselProps> = ({ templates }) => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Marketing', 'Sales', 'IT', 'HR', 'Finance'];

    const filteredTemplates = selectedCategory === 'All'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    const displayTemplates = filteredTemplates.slice(0, 6);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.max(1, displayTemplates.length - 2));
        }, 5000);

        return () => clearInterval(interval);
    }, [displayTemplates.length]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + displayTemplates.length) % displayTemplates.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % displayTemplates.length);
    };

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
                        Start with a template
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Pre-built workflows ready to use in minutes. Customize to fit your exact needs.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setCurrentIndex(0);
                            }}
                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${selectedCategory === category
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Carousel */}
                {displayTemplates.length > 0 ? (
                    <div className="relative">
                        {/* Templates Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {displayTemplates.slice(currentIndex, currentIndex + 3).map((template, idx) => (
                                <div
                                    key={template.id}
                                    onClick={() => router.push(`/marketplace/${template.id}`)}
                                    className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Category Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                            {template.category}
                                        </span>
                                        {template.is_free ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                                Free
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                                {template.credits_per_run} credits
                                            </span>
                                        )}
                                    </div>

                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                        {template.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                        {template.description}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <span className="text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                                            Use template
                                        </span>
                                        <svg className="w-5 h-5 text-orange-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={handlePrev}
                                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Previous"
                            >
                                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex gap-2">
                                {Array.from({ length: Math.max(1, displayTemplates.length - 2) }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                            ? 'bg-purple-600 w-8'
                                            : 'bg-slate-300 hover:bg-slate-400'
                                            }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Next"
                            >
                                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* View All Link */}
                        <div className="text-center mt-8">
                            <button
                                onClick={() => router.push('/marketplace')}
                                className="inline-flex items-center gap-2 text-orange-600 font-semibold text-lg hover:gap-3 transition-all"
                            >
                                View all {filteredTemplates.length} templates
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-lg">No templates found in this category</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default WorkflowCarousel;

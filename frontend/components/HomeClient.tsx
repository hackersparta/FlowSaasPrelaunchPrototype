"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import HeroSection from './home/HeroSection';
import ProductShowcase from './home/ProductShowcase';
import WorkflowCarousel from './home/WorkflowCarousel';
import StatsCounter from './home/StatsCounter';
import BeforeAfterComparison from './home/BeforeAfterComparison';
import ToolsShowcase from './home/ToolsShowcase';
import TrustLogos from './home/TrustLogos';
import SEOFooter from './home/SEOFooter';

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

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    tool_type: string;
    is_active: boolean;
    category: string;
}

const HomeClient = () => {
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetching for speed
                const [templatesRes, toolsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/templates`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tools/`)
                ]);

                if (templatesRes.ok) {
                    const data = await templatesRes.json();
                    setTemplates(data);
                }

                if (toolsRes.ok) {
                    const data = await toolsRes.json();
                    setTools(data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="relative min-h-screen bg-white">
            {/* Hero Section */}
            <HeroSection />

            {/* Trust Logos - Auto-scrolling */}
            <TrustLogos />


            {/* Product Showcase */}
            <ProductShowcase />

            {/* Workflow Carousel */}
            {!loading && templates.length > 0 && (
                <WorkflowCarousel templates={templates} />
            )}

            {/* Stats Counter */}
            <StatsCounter />

            {/* Before/After Comparison */}
            <BeforeAfterComparison />

            {/* Tools Showcase */}
            {!loading && tools.length > 0 && (
                <ToolsShowcase tools={tools} />
            )}

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        Ready to automate your workflows?
                    </h2>
                    <p className="text-xl md:text-2xl text-purple-100 mb-10 leading-relaxed">
                        Join 10,000+ users saving 20+ hours every week with FlowSaaS
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/signup"
                            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-orange-600 font-bold text-lg rounded-xl shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-105"
                        >
                            Start Free Today
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300"
                        >
                            Talk to Sales
                        </a>
                    </div>
                    <p className="mt-8 text-orange-100 text-sm">
                        No credit card required • Free forever plan • Cancel anytime
                    </p>
                </div>
            </section>

            {/* SEO Footer */}
            <SEOFooter />
        </div>
    );
};

export default HomeClient;

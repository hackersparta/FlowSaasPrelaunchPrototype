"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
    const router = useRouter();

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-20 max-w-6xl">
                <div className="text-center space-y-8 animate-fade-in-up">
                    {/* Trust Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-white"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">Join 10,000+ users automating smarter</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-slate-900 leading-[1.1] tracking-tight">
                        Automate Your Workflows
                        <br />
                        <span className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                            with AI-Powered Tools
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
                        Connect 100+ apps, automate repetitive tasks, and access free developer tools.
                        <br className="hidden md:block" />
                        No coding required. Save 20+ hours every week.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 h-16 text-lg font-semibold shadow-2xl shadow-orange-500/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50"
                            onClick={() => router.push('/signup')}
                        >
                            Start Free with Email
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-16 px-10 text-lg border-2 border-slate-300 text-slate-700 hover:bg-white hover:border-orange-300 hover:text-orange-700 rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            onClick={() => router.push('/marketplace')}
                        >
                            Explore Workflows
                        </Button>
                    </div>

                    {/* Trust Signals */}
                    <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Free forever plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">100+ integrations</span>
                        </div>
                    </div>

                    {/* Security Badges */}
                    <div className="flex justify-center items-center gap-6 pt-4 opacity-60">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            SOC 2 Compliant
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            GDPR Ready
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            256-bit Encryption
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;

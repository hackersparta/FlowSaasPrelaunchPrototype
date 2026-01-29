"use client";

import React from 'react';
import Link from 'next/link';

const SEOFooter = () => {
    const workflowCategories = [
        'Marketing Automation', 'Sales Workflows', 'IT Operations', 'HR Processes',
        'Finance Automation', 'Customer Support', 'Data Sync', 'Email Automation',
        'Social Media', 'Lead Generation', 'Reporting', 'Notifications'
    ];

    const toolCategories = [
        'JSON Tools', 'XML Tools', 'CSV Tools', 'Base64 Tools',
        'Text Formatters', 'Code Generators', 'Data Converters', 'Validators',
        'Encoders/Decoders', 'Hash Generators', 'String Utilities', 'Date Tools'
    ];

    const topSearches = [
        'Slack integrations', 'Gmail automation', 'Salesforce workflows',
        'HubSpot automation', 'GitHub integrations', 'Google Sheets sync',
        'Notion automation', 'Airtable workflows', 'Trello automation'
    ];

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Main Footer Content */}
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-white text-2xl font-display font-bold mb-4">FlowSaaS</h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Automate your workflows with AI-powered tools. Connect 100+ apps and access free developer utilities.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="/marketplace" className="hover:text-purple-400 transition-colors">Workflows</Link></li>
                            <li><Link href="/tools" className="hover:text-purple-400 transition-colors">Free Tools</Link></li>
                            <li><Link href="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/integrations" className="hover:text-purple-400 transition-colors">Integrations</Link></li>
                            <li><Link href="/docs" className="hover:text-purple-400 transition-colors">Documentation</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-purple-400 transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-purple-400 transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact</Link></li>
                            <li><Link href="/partners" className="hover:text-purple-400 transition-colors">Partners</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/security" className="hover:text-purple-400 transition-colors">Security</Link></li>
                            <li><Link href="/compliance" className="hover:text-purple-400 transition-colors">Compliance</Link></li>
                        </ul>
                    </div>
                </div>

                {/* SEO Section: Workflow Categories */}
                <div className="border-t border-slate-800 pt-12 mb-12">
                    <h4 className="text-white font-bold mb-6 text-lg">Popular Workflow Categories</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {workflowCategories.map((category) => (
                            <Link
                                key={category}
                                href={`/marketplace?category=${category.toLowerCase().replace(' ', '-')}`}
                                className="text-slate-400 hover:text-purple-400 transition-colors text-sm"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* SEO Section: Tool Categories */}
                <div className="border-t border-slate-800 pt-12 mb-12">
                    <h4 className="text-white font-bold mb-6 text-lg">Free Developer Tools</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {toolCategories.map((category) => (
                            <Link
                                key={category}
                                href={`/tools?category=${category.toLowerCase().replace(' ', '-')}`}
                                className="text-slate-400 hover:text-purple-400 transition-colors text-sm"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* SEO Section: Top Searches */}
                <div className="border-t border-slate-800 pt-12 mb-12">
                    <h4 className="text-white font-bold mb-6 text-lg">Top Searches</h4>
                    <div className="flex flex-wrap gap-3">
                        {topSearches.map((search) => (
                            <Link
                                key={search}
                                href={`/marketplace?q=${search.toLowerCase()}`}
                                className="px-4 py-2 bg-slate-800 hover:bg-purple-600 rounded-lg text-sm transition-colors"
                            >
                                {search}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* SEO Section: Alphabetical Directory */}
                <div className="border-t border-slate-800 pt-12 mb-12">
                    <h4 className="text-white font-bold mb-6 text-lg">Browse Workflows by Name</h4>
                    <div className="flex flex-wrap gap-2">
                        {alphabet.map((letter) => (
                            <Link
                                key={letter}
                                href={`/marketplace?letter=${letter}`}
                                className="w-10 h-10 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center font-bold transition-colors"
                            >
                                {letter}
                            </Link>
                        ))}
                        <Link
                            href="/marketplace?letter=0-9"
                            className="w-16 h-10 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center font-bold transition-colors"
                        >
                            0-9
                        </Link>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="border-t border-slate-800 pt-12 mb-12">
                    <div className="max-w-2xl mx-auto text-center">
                        <h4 className="text-white font-bold mb-3 text-2xl">Stay updated</h4>
                        <p className="text-slate-400 mb-6">Get the latest workflows, tools, and automation tips delivered to your inbox</p>
                        <div className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            />
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition-all">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© 2026 FlowSaaS. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>SOC 2 Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>GDPR Ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>256-bit Encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SEOFooter;

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ToolsClient() {
    const router = useRouter();
    const [tools, setTools] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTools = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tools/`);
                if (res.ok) {
                    const data = await res.json();
                    setTools(data);
                }
            } catch (err) {
                console.error('Failed to fetch tools', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, []);

    const filteredTools = tools.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#2D2E2E]">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-8 h-8 bg-[#FF4F00] rounded-lg"></div>
                        <span className="font-bold text-xl tracking-tight">FlowSaaS</span>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => router.push('/marketplace')}>Marketplace</Button>
                        <Button onClick={() => router.push('/dashboard')} className="bg-[#2D2E2E] hover:bg-black text-white">Dashboard</Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-serif font-medium text-[#2D2E2E] mb-4">Free Developer Tools</h1>
                    <p className="text-xl text-slate-500 font-light mb-8">
                        Every utility you need, completely free. No signup required.
                    </p>

                    <div className="relative max-w-lg mx-auto">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tools (e.g. JSON, UUID, Base64)..."
                            className="h-14 pl-12 text-lg border-slate-300 shadow-sm rounded-full focus:ring-[#FF4F00] focus:border-[#FF4F00]"
                        />
                        <svg className="absolute left-4 top-4 text-slate-400 w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTools.map(tool => (
                            <div
                                key={tool.id}
                                onClick={() => router.push(`/tools/${tool.slug}`)}
                                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center group h-56 justify-center"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-[#FF4F00] group-hover:scale-110 transition-transform shadow-sm border border-slate-100">
                                    <span className="text-2xl">🛠️</span>
                                </div>
                                <h3 className="font-bold text-lg text-[#2D2E2E] group-hover:text-[#FF4F00] transition-colors mb-2 line-clamp-1">
                                    {tool.name}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                    {tool.description}
                                </p>
                            </div>
                        ))}
                        {filteredTools.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-500">
                                No tools found matching "{search}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function Marketplace() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('http://localhost:8000/templates');
                if (!res.ok) throw new Error('Failed to fetch templates');
                const data = await res.json();
                setTemplates(data);
            } catch (err) {
                console.error('Marketplace error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

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
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                        <Button onClick={() => router.push('/tools')} variant="outline">Free Tools</Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-serif font-medium text-[#2D2E2E] mb-4">Marketplace</h1>
                    <p className="text-xl text-slate-500 font-light">
                        Discover pre-built automation workflows to supercharge your productivity.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {templates.map(t => (
                            <div key={t.id} className="group bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF4F00] opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-6">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {t.category || 'Utility'}
                                    </span>
                                    <span className={`text-sm font-bold flex items-center ${t.is_free ? 'text-green-600' : 'text-[#FF4F00]'}`}>
                                        {t.is_free ? 'FREE' : `${t.credits_per_run} Credits`}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-[#2D2E2E] mb-3 group-hover:text-[#FF4F00] transition-colors">
                                    {t.name}
                                </h3>

                                <p className="text-slate-500 mb-8 leading-relaxed flex-grow">
                                    {t.description}
                                </p>

                                <Button
                                    className="w-full bg-[#FF4F00] hover:bg-[#E64600] text-white font-semibold shadow-md shadow-orange-100"
                                    onClick={() => router.push(`/marketplace/${t.id}`)}
                                >
                                    View Details
                                </Button>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full text-center py-24 bg-white border border-dashed border-slate-300 rounded-xl">
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-lg font-bold text-slate-700">No active templates found</h3>
                                <p className="text-slate-500 mt-2">Check back soon for new workflows.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

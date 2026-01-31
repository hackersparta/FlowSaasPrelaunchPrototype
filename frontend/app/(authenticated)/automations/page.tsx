'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Execution {
    id: string;
    status: string;
    workflow_name: string;
    template_id: string;
    started_at: string;
    credits_used: number;
    error_message?: string;
}

export default function AutomationsPage() {
    const router = useRouter();
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(true);

    const loadExecutions = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/executions/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setExecutions(data);
            }
        } catch (error) {
            console.error('Failed to load executions:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadExecutions();
    }, [loadExecutions]);

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS': return 'bg-green-100 text-green-700 border-green-200';
            case 'FAILED': return 'bg-red-50 text-red-600 border-red-100';
            case 'RUNNING': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF4F00] border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#2D2E2E]">


            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#2D2E2E] mb-2">My Automations</h1>
                        <p className="text-slate-500">Track your recent workflow runs.</p>
                    </div>
                    <Button onClick={() => loadExecutions()} variant="outline" size="sm">
                        Refresh
                    </Button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {executions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                ⚡
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">No runs yet</h3>
                            <p className="text-slate-500 mb-6">Start your first automation from the marketplace.</p>
                            <Button onClick={() => router.push('/marketplace')} className="bg-[#FF4F00] hover:bg-[#E64600]">
                                Explore Marketplace
                            </Button>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Workflow</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Key</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Started</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Credits</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {executions.map((exc) => (
                                    <tr
                                        key={exc.id}
                                        onClick={() => router.push(`/automations/${exc.id}`)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`border-none px-2 py-1 ${getStatusStyle(exc.status)}`}>
                                                {exc.status === 'SUCCESS' && '✅ '}
                                                {exc.status === 'FAILED' && '⚠️ '}
                                                {exc.status === 'RUNNING' && '🔄 '}
                                                {exc.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 group-hover:text-[#FF4F00] transition-colors">
                                                {exc.workflow_name}
                                            </div>
                                            {exc.error_message && (
                                                <div className="text-xs text-red-500 mt-1 truncate max-w-md">
                                                    {exc.error_message}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                            {exc.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(exc.started_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 text-right font-mono">
                                            -{exc.credits_used}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-slate-300 group-hover:text-slate-500">→</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

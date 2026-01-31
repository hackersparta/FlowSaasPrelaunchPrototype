'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [executions, setExecutions] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch User Stats
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Unauthorized');
                return res.json();
            })
            .then(data => setUser(data))
            .catch(() => {
                localStorage.removeItem('token');
                router.push('/login');
            });

        // Fetch Recent Executions
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/executions/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setExecutions(data);
                }
            })
            .catch(err => console.error("Failed to load executions:", err));

    }, [router]);

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-500">
            <div className="animate-pulse">Loading dashboard...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#2D2E2E]">
            {/* Header - White with border */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-8 h-8 bg-[#FF4F00] rounded-lg"></div>
                        <span className="font-bold text-xl tracking-tight">FlowSaaS</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user.is_admin && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-[#FF4F00] hover:bg-orange-50"
                                onClick={() => router.push('/admin')}
                            >
                                Admin Panel
                            </Button>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                            <span className="text-sm font-medium text-slate-500">Credits</span>
                            <span className="text-sm font-bold text-[#FF4F00]">{user.credits}</span>
                        </div>

                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs" title={user.email}>
                            {user.email.substring(0, 2).toUpperCase()}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-900"
                            onClick={() => {
                                localStorage.removeItem('token');
                                router.push('/login');
                            }}
                        >
                            Log out
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Welcome Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-serif font-medium text-[#2D2E2E] mb-2">
                        Welcome back, {user.email.split('@')[0]}
                    </h1>
                    <p className="text-slate-500">
                        Manage your workflows and track automations.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Active Automations</h3>
                        <p className="text-4xl font-bold mt-2 text-[#2D2E2E]">{user.active_automations_count || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Executions</h3>
                        <p className="text-4xl font-bold mt-2 text-[#2D2E2E]">{user.total_executions_count || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Success Rate</h3>
                        <p className="text-4xl font-bold mt-2 text-green-600">{user.success_rate !== undefined ? user.success_rate + '%' : '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content: Executions */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="font-bold text-lg text-[#2D2E2E]">Recent Activity</h2>
                                <Button variant="link" size="sm" className="text-[#FF4F00] font-semibold" onClick={() => router.push('/executions')}>
                                    View all
                                </Button>
                            </div>

                            <div className="p-0">
                                {executions.length === 0 ? (
                                    <div className="text-center text-slate-500 py-16 px-6">
                                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                        </div>
                                        <p className="mb-6">No executions yet. Activate a template to get started.</p>
                                        <Button onClick={() => router.push('/marketplace')}>
                                            Browse Marketplace
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {executions.slice(0, 5).map((exec: any) => (
                                            <div key={exec.id} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-2 rounded-full ${exec.status === 'SUCCESS' ? 'bg-green-500' :
                                                        exec.status === 'FAILED' ? 'bg-red-500' : 'bg-amber-500'
                                                        }`} />
                                                    <div>
                                                        <div className="font-medium text-slate-700">Workflow Execution</div>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(exec.started_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${exec.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                        exec.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {exec.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="font-bold text-lg mb-4 text-[#2D2E2E]">Quick Actions</h2>
                            <div className="space-y-3">
                                <Button
                                    className="w-full justify-start text-slate-600 hover:text-[#FF4F00] hover:bg-orange-50 h-auto py-3 px-4"
                                    variant="ghost"
                                    onClick={() => router.push('/credentials')}
                                >
                                    <span className="mr-3">🔐</span> Manage Credentials
                                </Button>
                                <Button
                                    className="w-full justify-start text-slate-600 hover:text-[#FF4F00] hover:bg-orange-50 h-auto py-3 px-4"
                                    variant="ghost"
                                    onClick={() => router.push('/credits')}
                                >
                                    <span className="mr-3">💳</span> Top Up Credits
                                </Button>
                                <Button
                                    className="w-full justify-start text-slate-600 hover:text-[#FF4F00] hover:bg-orange-50 h-auto py-3 px-4"
                                    variant="ghost"
                                    onClick={() => router.push('/marketplace')}
                                >
                                    <span className="mr-3">🔎</span> Explore Marketplace
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#FF4F00] to-[#FF8C00] p-6 rounded-xl shadow-lg text-white">
                            <h3 className="font-bold text-lg mb-2">Need a custom workflow?</h3>
                            <p className="text-white/90 text-sm mb-4">
                                Use our AI generator to build custom automations in seconds.
                            </p>
                            <Button className="w-full bg-white text-[#FF4F00] hover:bg-slate-50 border-none shadow-sm font-bold">
                                Try AI Generator
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

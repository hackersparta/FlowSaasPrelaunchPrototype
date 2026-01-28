'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalTemplates: 0,
        activeTemplates: 0,
        inactiveTemplates: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Check if user is admin
        fetch('http://localhost:8000/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Unauthorized');
                return res.json();
            })
            .then(data => {
                if (!data.is_admin) {
                    router.push('/dashboard');
                    return;
                }
                setUser(data);
                loadStats(token);
            })
            .catch(() => {
                localStorage.removeItem('token');
                router.push('/login');
            });
    }, [router]);

    const loadStats = async (token: string) => {
        try {
            const res = await fetch('http://localhost:8000/admin/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const templates = await res.json();

            setStats({
                totalTemplates: templates.length,
                activeTemplates: templates.filter((t: any) => t.is_active).length,
                inactiveTemplates: templates.filter((t: any) => !t.is_active).length
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !user) {
        return <div className="min-h-screen bg-slate-950 text-white p-8">Loading admin panel...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-400">Admin Panel</h1>
                        <p className="text-slate-400">Workflow Template Management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            User Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => {
                            localStorage.removeItem('token');
                            router.push('/login');
                        }}>
                            Sign Out
                        </Button>
                    </div>
                </header>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-xl border border-blue-800/50">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Total Templates</h3>
                        <p className="text-4xl font-bold text-blue-400">{stats.totalTemplates}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-xl border border-green-800/50">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Active Templates</h3>
                        <p className="text-4xl font-bold text-green-400">{stats.activeTemplates}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/20 p-6 rounded-xl border border-slate-700/50">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Inactive Templates</h3>
                        <p className="text-4xl font-bold text-slate-300">{stats.inactiveTemplates}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800">
                    <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            className="h-20 text-lg bg-blue-600 hover:bg-blue-700"
                            onClick={() => router.push('/admin/templates/import')}
                        >
                            📤 Upload New Template
                        </Button>
                        <Button
                            className="h-20 text-lg bg-slate-700 hover:bg-slate-600"
                            onClick={() => router.push('/admin/templates')}
                        >
                            📋 Manage Templates
                        </Button>
                        <Button
                            className="h-20 text-lg bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => router.push('/admin/ai-generator')}
                        >
                            ✨ AI Workflow Generator
                        </Button>
                        <Button
                            className="h-20 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            onClick={() => router.push('/admin/ai-tool-generator')}
                        >
                            ⚡ AI Tool Generator
                        </Button>
                        <Button
                            className="h-20 text-lg bg-purple-600 hover:bg-purple-700"
                            onClick={() => router.push('/admin/tools')}
                        >
                            🛠️ Manage Free Tools
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

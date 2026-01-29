'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    LayoutTemplate,
    CheckCircle2,
    XCircle,
    Upload,
    FileEdit,
    Sparkles,
    Bot,
    Wrench
} from 'lucide-react';

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
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
                    <p className="text-slate-500 mt-1">Manage templates, tools, and system configuration</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <LayoutTemplate className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.totalTemplates}</h3>
                        <p className="text-slate-500 text-sm mt-1">Available Templates</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.activeTemplates}</h3>
                        <p className="text-slate-500 text-sm mt-1">Live in Marketplace</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inactive</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.inactiveTemplates}</h3>
                        <p className="text-slate-500 text-sm mt-1">Drafts / Hidden</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                        className="h-auto py-6 flex flex-col items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm hover:shadow-md transition-all group"
                        variant="ghost"
                        onClick={() => router.push('/admin/templates/import')}
                    >
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold">Upload Template</span>
                            <span className="text-xs text-slate-400 font-normal">Import from JSON/File</span>
                        </div>
                    </Button>

                    <Button
                        className="h-auto py-6 flex flex-col items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm hover:shadow-md transition-all group"
                        variant="ghost"
                        onClick={() => router.push('/admin/templates')}
                    >
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                            <FileEdit className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold">Manage Templates</span>
                            <span className="text-xs text-slate-400 font-normal">Edit, Delete, & Organize</span>
                        </div>
                    </Button>

                    <Button
                        className="h-auto py-6 flex flex-col items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm hover:shadow-md transition-all group"
                        variant="ghost"
                        onClick={() => router.push('/admin/ai-generator')}
                    >
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold">AI Workflow Generator</span>
                            <span className="text-xs text-slate-400 font-normal">Create with AI</span>
                        </div>
                    </Button>

                    <Button
                        className="h-auto py-6 flex flex-col items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm hover:shadow-md transition-all group"
                        variant="ghost"
                        onClick={() => router.push('/admin/ai-tool-generator')}
                    >
                        <div className="p-3 bg-pink-50 text-pink-600 rounded-full group-hover:scale-110 transition-transform">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold">AI Tool Generator</span>
                            <span className="text-xs text-slate-400 font-normal">Create custom tools</span>
                        </div>
                    </Button>

                    <Button
                        className="h-auto py-6 flex flex-col items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm hover:shadow-md transition-all group"
                        variant="ghost"
                        onClick={() => router.push('/admin/tools')}
                    >
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:scale-110 transition-transform">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold">Manage Free Tools</span>
                            <span className="text-xs text-slate-400 font-normal">Configure tool settings</span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}

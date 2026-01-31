'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TemplateList() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTemplates = async () => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/templates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorText = await res.text();
                // console.error('Error response:', errorText); // Keeping error log if needed, or removing as requested? User said "unrequired line of code eg;(console.logs, etcccc)". console.error is usually kept.
                console.error('Error response:', errorText);
                throw new Error('Failed to fetch');
            }
            const data = await res.json();
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
            alert('Failed to load templates. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const toggleStatus = async (templateId: string, isActive: boolean) => {
        const token = localStorage.getItem('token');
        const endpoint = isActive ? 'deactivate' : 'activate';
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/templates/${templateId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) loadTemplates();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const deleteTemplate = async (templateId: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/templates/${templateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    if (loading) return <div className="text-white p-8">Loading templates...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Templates</h1>
                        <p className="text-slate-400 mt-2">Activate, edit, or test your workflow templates</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => router.push('/admin')}>
                            Back to Admin
                        </Button>
                        <Button color="blue" onClick={() => router.push('/admin/templates/import')}>
                            + New Template
                        </Button>
                    </div>
                </header>

                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Pricing</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {templates.map((template) => (
                                <tr key={template.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{template.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline">{template.category || 'N/A'}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {template.is_free ? (
                                            <span className="text-green-400">Free</span>
                                        ) : (
                                            <span>{template.credits_per_run} Credits</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {template.is_active ? (
                                            <span className="flex items-center text-green-400">
                                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-slate-500">
                                                <span className="w-2 h-2 bg-slate-500 rounded-full mr-2"></span>
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/templates/${template.id}/test`)}>
                                                🧪 Test
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/templates/${template.id}/edit`)}>
                                                ⚙️ Configure
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={template.is_active ? "text-amber-400 border-amber-900/50 hover:bg-amber-900/20" : "text-green-400 border-green-900/50 hover:bg-green-900/20"}
                                                onClick={() => toggleStatus(template.id, template.is_active)}
                                            >
                                                {template.is_active ? "Deactivate" : "Activate"}
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => deleteTemplate(template.id)}>
                                                🗑️
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {templates.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No templates found. Go ahead and import your first one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function EditTemplate() {
    const router = useRouter();
    const { id } = useParams();
    const [inputSchema, setInputSchema] = useState<any[]>([]);
    const [template, setTemplate] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        is_free: false,
        credits_per_run: 0,
        input_schema: '[]'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTemplate = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:8000/admin/templates/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Template not found');
                const data = await res.json();
                setTemplate(data);

                // Set form basic data
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    category: data.category || '',
                    is_free: data.is_free || false,
                    credits_per_run: data.credits_per_run || 0,
                    input_schema: data.input_schema || '[]'
                });

                // Parse input schema for structured UI
                if (data.input_schema) {
                    try {
                        setInputSchema(JSON.parse(data.input_schema));
                    } catch {
                        setInputSchema([]);
                    }
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        const token = localStorage.getItem('token');
        try {
            // Stringify the structured schema back to JSON for the backend
            const payload = {
                ...formData,
                input_schema: JSON.stringify(inputSchema)
            };

            const res = await fetch(`http://localhost:8000/admin/templates/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to save template');
            router.push('/admin/templates');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const addInputField = () => {
        setInputSchema([...inputSchema, { id: crypto.randomUUID().slice(0, 8), label: '', type: 'text', placeholder: '' }]);
    };

    const updateInputField = (index: number, updates: any) => {
        const updated = [...inputSchema];
        updated[index] = { ...updated[index], ...updates };
        setInputSchema(updated);
    };

    const removeInputField = (index: number) => {
        setInputSchema(inputSchema.filter((_, i) => i !== index));
    };

    if (loading) return <div className="text-white p-8 font-medium">Loading template details...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100 selection:bg-blue-500/30">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Configure Template</h1>
                        <p className="text-slate-400 mt-1">Refine pricing and map dynamic JSON parameters</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/admin/templates')} className="border-slate-800 hover:bg-slate-900">
                        Cancel
                    </Button>
                </header>

                <div className="grid grid-cols-1 gap-8 mb-20">
                    {/* Basic Info Section */}
                    <section className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/60 shadow-xl">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-blue-400">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Template Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Category</Label>
                                <Input
                                    value={formData.category}
                                    placeholder="e.g. Marketing, Bot, Utility"
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 mt-6">
                            <Label className="text-slate-300">Description</Label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full h-24 bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                        </div>
                    </section>

                    {/* Pricing Section */}
                    <section className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/60 shadow-xl">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-purple-400">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            Pricing & Access
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-xl border border-slate-800/40 mb-6">
                            <div className="space-y-1">
                                <Label className="text-base font-bold">Free Usage</Label>
                                <p className="text-xs text-slate-500">Users can run this template without spending credits</p>
                            </div>
                            <Switch
                                checked={formData.is_free}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                            />
                        </div>

                        {!formData.is_free && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-slate-300">Credits Per Run</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        value={formData.credits_per_run}
                                        onChange={(e) => setFormData({ ...formData, credits_per_run: parseInt(e.target.value) || 0 })}
                                        className="bg-slate-950/50 border-slate-800 focus:border-blue-500/50 w-32"
                                    />
                                    <span className="text-sm text-slate-500">credits will be deducted from user balance</span>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Input Mapping Section */}
                    <section className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/60 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-emerald-400">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                Dynamic Parameter Mapping
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                onClick={addInputField}
                            >
                                + Add Input Field
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {inputSchema.map((field, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-950/50 rounded-xl border border-slate-800/80 relative">
                                    <div className="space-y-1.5 md:col-span-1">
                                        <Label className="text-xs text-slate-500 uppercase tracking-wider">Field Label (User views)</Label>
                                        <Input
                                            placeholder="e.g. Telegram Account"
                                            value={field.label}
                                            onChange={(e) => updateInputField(index, { label: e.target.value })}
                                            className="bg-slate-900 border-slate-800 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-1">
                                        <Label className="text-xs text-slate-500 uppercase tracking-wider">JSON Placeholder ID</Label>
                                        <Input
                                            placeholder="e.g. zzI60nCS38c38MsJ"
                                            value={field.placeholder}
                                            onChange={(e) => updateInputField(index, { placeholder: e.target.value })}
                                            className="bg-slate-900 border-slate-800 text-sm font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-1">
                                        <Label className="text-xs text-slate-500 uppercase tracking-wider">Field Type</Label>
                                        <select
                                            className="w-full h-10 bg-slate-900 border border-slate-800 rounded-md px-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                            value={field.type}
                                            onChange={(e) => updateInputField(index, { type: e.target.value })}
                                        >
                                            <option value="text">Text Input</option>
                                            <option value="credential">Credential ID</option>
                                            <option value="number">Number</option>
                                            <option value="password">Secure Secret</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end justify-end md:col-span-1">
                                        <Button
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 w-full"
                                            onClick={() => removeInputField(index)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {inputSchema.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800/50 rounded-2xl text-slate-500">
                                    <p className="text-sm">No dynamic parameters configured.</p>
                                    <p className="text-xs mt-1">This workflow will execute exactly as defined in the JSON.</p>
                                </div>
                            )}

                            <div className="mt-8 p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl flex gap-3">
                                <div className="text-blue-400 mt-0.5 font-bold">ℹ️</div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <strong>How mapping works:</strong> During execution, FlowSaaS will scan the entire workflow JSON.
                                    Every time it finds the <em>JSON Placeholder ID</em>, it will substitute it with the value the user enters in the form.
                                    This is perfect for substituting credential IDs or target channel IDs.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Preview Section */}
                    <section className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/60 shadow-xl">
                        <Label className="text-lg font-semibold mb-4 block">Workflow JSON Snapshot</Label>
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 font-mono text-[10px] overflow-auto max-h-60 text-slate-500 custom-scrollbar">
                            <pre>{template?.workflow_json}</pre>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 italic">Copy the ID values from above to use as placeholders in mappings.</p>
                    </section>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-center gap-3">
                            <span className="font-bold">⚠️</span> {error}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4">
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving System Changes...' : 'Confirm Configuration'}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-xl border-slate-800 hover:bg-slate-900 text-lg transition-all"
                            onClick={() => router.push(`/admin/templates/${id}/test`)}
                        >
                            Test Execution 🧪
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ImportTemplate() {
    const router = useRouter();
    const [jsonContent, setJsonContent] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [creditsPerRun, setCreditsPerRun] = useState(0);
    const [inputSchema, setInputSchema] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonContent(content);

            // Try to parse and extract name from workflow
            try {
                const workflow = JSON.parse(content);
                if (workflow.name && !name) {
                    setName(workflow.name);
                }
            } catch (err) {
                console.error('Failed to parse JSON:', err);
            }
        };
        reader.readAsText(file);
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

    const handleUpload = async () => {
        if (!jsonContent || !name) {
            setError('Please provide workflow JSON and template name');
            return;
        }

        // Validate JSON
        try {
            JSON.parse(jsonContent);
        } catch (err) {
            setError('Invalid JSON format');
            return;
        }

        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:8000/admin/templates/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workflow_json: jsonContent,
                    name,
                    description,
                    category,
                    is_free: isFree,
                    credits_per_run: creditsPerRun,
                    input_schema: JSON.stringify(inputSchema)
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const template = await res.json();
            // Redirect to test page as the next logical step after full config import
            router.push(`/admin/templates/${template.id}/test`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Upload Workflow Template</h1>
                        <p className="text-slate-400 mt-2">Upload n8n workflow JSON to create a new template</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                        Back to Admin
                    </Button>
                </header>

                <div className="space-y-8">
                    {/* Step 1: File Selection */}
                    <section className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-blue-400">Step 1: Upload n8n Workflow JSON</label>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-slate-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-600 file:text-white
                                    hover:file:bg-blue-700
                                    cursor-pointer"
                            />
                        </div>

                        {jsonContent && (
                            <div>
                                <label className="block text-sm font-medium mb-2">JSON Preview (Snapshot)</label>
                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[10px] overflow-auto max-h-40 text-slate-500">
                                    <pre>{jsonContent}</pre>
                                </div>
                            </div>
                        )}
                    </section>

                    {jsonContent && (
                        <>
                            {/* Step 2: Information */}
                            <section className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 space-y-6">
                                <h2 className="text-lg font-semibold text-blue-400">Step 2: Template Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Template Name *</label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Instagram Auto-Responder"
                                            className="bg-slate-800 border-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Category</label>
                                        <Input
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            placeholder="e.g. Marketing, Automation"
                                            className="bg-slate-800 border-slate-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm"
                                        placeholder="Describe what this template does..."
                                    />
                                </div>
                            </section>

                            {/* Step 3: Pricing */}
                            <section className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 space-y-6">
                                <h2 className="text-lg font-semibold text-purple-400">Step 3: Pricing & Access</h2>
                                <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-xl border border-slate-800/40">
                                    <div>
                                        <Label className="text-base font-bold">Free Usage</Label>
                                        <p className="text-xs text-slate-500">Users run this for free</p>
                                    </div>
                                    <Switch
                                        checked={isFree}
                                        onCheckedChange={setIsFree}
                                    />
                                </div>

                                {!isFree && (
                                    <div className="space-y-3">
                                        <Label>Credits Per Run</Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                value={creditsPerRun}
                                                onChange={(e) => setCreditsPerRun(parseInt(e.target.value) || 0)}
                                                className="bg-slate-800 border-slate-700 w-32"
                                            />
                                            <span className="text-sm text-slate-400">credits deducted per use</span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Step 4: Parameter Mapping */}
                            <section className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-emerald-400">Step 4: Dynamic Parameter Mapping</h2>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                        onClick={addInputField}
                                    >
                                        + Add Mapping
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {inputSchema.map((field: any, index: number) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-500">Label (User views)</Label>
                                                <Input
                                                    placeholder="e.g. Account ID"
                                                    value={field.label}
                                                    onChange={(e) => updateInputField(index, { label: e.target.value })}
                                                    className="bg-slate-800 border-slate-700 h-9 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-500">JSON Placeholder</Label>
                                                <Input
                                                    placeholder="zzI60c..."
                                                    value={field.placeholder}
                                                    onChange={(e) => updateInputField(index, { placeholder: e.target.value })}
                                                    className="bg-slate-800 border-slate-700 h-9 font-mono text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-500">Type</Label>
                                                <select
                                                    className="w-full h-9 bg-slate-800 border border-slate-700 rounded-md px-2 text-xs"
                                                    value={field.type}
                                                    onChange={(e) => updateInputField(index, { type: e.target.value })}
                                                >
                                                    <option value="text">Text Input</option>
                                                    <option value="credential">Credential ID</option>
                                                    <option value="number">Number</option>
                                                    <option value="password">Secure Secret</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    variant="ghost"
                                                    className="text-red-400 hover:bg-red-950 h-9 w-full"
                                                    onClick={() => removeInputField(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {inputSchema.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                                            No mappings added yet.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Global Actions */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            onClick={handleUpload}
                            disabled={loading || !jsonContent || !name}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold"
                        >
                            {loading ? 'Processing...' : 'Create Template & Proceed to Test'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/admin')}
                            disabled={loading}
                            className="h-12 border-slate-800"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

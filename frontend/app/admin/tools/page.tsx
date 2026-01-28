'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Tool {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    icon: string;
    is_active: boolean;
    usage_count: number;
}

export default function AdminToolsPage() {
    const router = useRouter();
    const [tools, setTools] = useState<Tool[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        category: 'Converter',
        icon: '🔧',
        input_type: 'text',
        output_type: 'text',
        python_code: ''
    });

    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:8000/admin/tools/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTools(data))
            .catch(() => router.push('/login'));
    };

    const uploadTool = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:8000/admin/tools/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Tool uploaded successfully!');
                setShowUploadForm(false);
                loadTools();
                // Reset form
                setFormData({
                    name: '',
                    slug: '',
                    description: '',
                    category: 'Converter',
                    icon: '🔧',
                    input_type: 'text',
                    output_type: 'text',
                    python_code: ''
                });
            } else {
                alert('Failed to upload tool');
            }
        } catch (err) {
            alert('Error uploading tool');
        }
    };

    const toggleActive = async (toolId: string, isActive: boolean) => {
        const token = localStorage.getItem('token');
        const endpoint = isActive ? 'deactivate' : 'activate';

        await fetch(`http://localhost:8000/admin/tools/${toolId}/${endpoint}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        loadTools();
    };

    const deleteTool = async (toolId: string) => {
        if (!confirm('Are you sure you want to delete this tool?')) return;

        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8000/admin/tools/${toolId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        loadTools();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/dashboard')}
                            className="mb-4 text-slate-400"
                        >
                            ← Back to Dashboard
                        </Button>
                        <h1 className="text-4xl font-bold">Manage Tools</h1>
                        <p className="text-slate-400 mt-2">{tools.length} total tools</p>
                    </div>
                    <Button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {showUploadForm ? 'Cancel' : '+ Upload New Tool'}
                    </Button>
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8">
                        <h2 className="text-2xl font-bold mb-6">Upload New Tool</h2>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm mb-2">Tool Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Free JSON Formatter Online"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="json-formatter-online-free"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm mb-2">Description (SEO)</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Format, validate and beautify JSON online for free..."
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                                >
                                    <option>Converter</option>
                                    <option>Generator</option>
                                    <option>Text</option>
                                    <option>PDF</option>
                                    <option>Image</option>
                                    <option>Video</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Input Type</label>
                                <select
                                    value={formData.input_type}
                                    onChange={(e) => setFormData({ ...formData, input_type: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                                >
                                    <option>text</option>
                                    <option>file</option>
                                    <option>none</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Output Type</label>
                                <select
                                    value={formData.output_type}
                                    onChange={(e) => setFormData({ ...formData, output_type: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                                >
                                    <option>text</option>
                                    <option>file</option>
                                    <option>json</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm mb-2">Python Code</label>
                            <textarea
                                value={formData.python_code}
                                onChange={(e) => setFormData({ ...formData, python_code: e.target.value })}
                                placeholder="def execute(input_data: str):&#10;    # Your code here&#10;    return {'success': True, 'output': result}"
                                className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm"
                            />
                        </div>

                        <Button
                            onClick={uploadTool}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Upload Tool
                        </Button>
                    </div>
                )}

                {/* Tools List */}
                <div className="grid gap-4">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">{tool.icon}</div>
                                <div>
                                    <h3 className="text-lg font-semibold">{tool.name}</h3>
                                    <p className="text-sm text-slate-400">{tool.description}</p>
                                    <div className="flex gap-3 mt-2 text-xs">
                                        <span className="text-blue-400">{tool.category}</span>
                                        <span className="text-slate-500">{tool.usage_count} uses</span>
                                        <span className={tool.is_active ? 'text-green-400' : 'text-red-400'}>
                                            {tool.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => toggleActive(tool.id, tool.is_active)}
                                    variant="outline"
                                    className={tool.is_active ? 'border-red-500 text-red-400' : 'border-green-500 text-green-400'}
                                >
                                    {tool.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    onClick={() => deleteTool(tool.id)}
                                    variant="outline"
                                    className="border-red-500 text-red-400"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

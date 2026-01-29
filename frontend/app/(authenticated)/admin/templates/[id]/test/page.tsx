'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TestTemplate() {
    const router = useRouter();
    const { id } = useParams();
    const [template, setTemplate] = useState<any>(null);
    const [inputSchema, setInputSchema] = useState<any[]>([]);
    const [testData, setTestData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<any>(null);
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

                try {
                    const schema = JSON.parse(data.input_schema || '[]');
                    setInputSchema(Array.isArray(schema) ? schema : []);
                    // Initialize test data with empty strings using labels as keys
                    const initialData: any = {};
                    (Array.isArray(schema) ? schema : []).forEach((field: any) => {
                        initialData[field.label] = '';
                    });
                    setTestData(initialData);
                } catch (e) {
                    console.error('Invalid schema JSON');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [id]);

    const handleRunTest = async () => {
        setTesting(true);
        setError('');
        setResult(null);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8000/admin/templates/${id}/test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    template_id: id,
                    test_data: testData
                })
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || 'Execution failed');
            }
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setTesting(false);
        }
    };

    const handleActivate = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8000/admin/templates/${id}/activate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                router.push('/admin/templates');
            } else {
                const data = await res.json();
                setError(data.detail || 'Activation failed');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-white p-8">Loading test environment...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">Test Workflow</h1>
                            <Badge variant="outline" className="text-blue-400 border-blue-900">{template.name}</Badge>
                        </div>
                        <p className="text-slate-400 mt-2">Verify the template works correctly before activating it for users</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/admin/templates/${id}/edit`)}>
                        Back to Edit
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800">
                        <h2 className="text-xl font-semibold mb-6 text-blue-400">Test Inputs</h2>

                        {inputSchema.length > 0 ? (
                            <div className="space-y-4">
                                {inputSchema.map((field: any) => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="text-sm font-medium">{field.label}</label>
                                        <Input
                                            type={field.type === 'password' ? 'password' : 'text'}
                                            value={testData[field.label] || ''}
                                            onChange={(e) => setTestData({ ...testData, [field.label]: e.target.value })}
                                            className="bg-slate-800 border-slate-700"
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    </div>
                                ))}
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 mt-6 h-12 text-lg"
                                    onClick={handleRunTest}
                                    disabled={testing}
                                >
                                    {testing ? 'Executing Workflow...' : 'Run Test Execution ⚡'}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500 mb-4">No input fields defined for this template.</p>
                                <Button variant="outline" onClick={() => router.push(`/admin/templates/${id}/edit`)}>
                                    Go to Configuration
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Output/Result */}
                    <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 flex flex-col">
                        <h2 className="text-xl font-semibold mb-6 text-blue-400">Execution Result</h2>

                        {testing ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                Running in n8n engine...
                            </div>
                        ) : result ? (
                            <div className="flex-1 space-y-4">
                                <div className={`p-4 rounded-lg border ${result.success ? "bg-green-900/20 border-green-800" : "bg-red-900/20 border-red-800"}`}>
                                    <div className="font-bold flex items-center justify-between">
                                        <span>Status: {result.success ? 'SUCCESS' : 'FAILED'}</span>
                                        {result.execution_id && <Badge variant="secondary">ID: {result.execution_id}</Badge>}
                                    </div>
                                    {result.error && <p className="text-red-400 text-sm mt-2">{result.error}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Response Data</label>
                                    <pre className="w-full bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono overflow-auto max-h-[300px]">
                                        {JSON.stringify(result.result || result, null, 2)}
                                    </pre>
                                </div>

                                {result.success && !template.is_active && (
                                    <div className="mt-8 p-4 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                                        <p className="text-sm text-slate-300 mb-4">Verification successful! You can now activate this template for your users.</p>
                                        <Button className="w-full bg-green-600 hover:bg-green-700 h-10" onClick={handleActivate}>
                                            Activate Template for Marketplace 🚀
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex items-center justify-center p-8 text-red-400 text-center">
                                Error: {error}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-12 text-slate-600 text-center border-2 border-dashed border-slate-800 rounded-lg">
                                Test results will appear here after execution.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

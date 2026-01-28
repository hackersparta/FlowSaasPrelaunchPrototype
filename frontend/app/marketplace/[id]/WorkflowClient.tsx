'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Props = {
    id: string
}

export default function WorkflowClient({ id }: Props) {
    const router = useRouter();
    const [template, setTemplate] = useState<any>(null);
    const [inputSchema, setInputSchema] = useState<any[]>([]);
    const [userInputs, setUserInputs] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                const res = await fetch(`http://localhost:8000/templates/${id}`);
                if (!res.ok) throw new Error('Template not found');
                const data = await res.json();
                setTemplate(data);

                if (data.input_schema) {
                    try {
                        const schema = JSON.parse(data.input_schema);
                        setInputSchema(Array.isArray(schema) ? schema : []);

                        const initial: any = {};
                        (Array.isArray(schema) ? schema : []).forEach((f: any) => {
                            initial[f.label] = '';
                        });
                        setUserInputs(initial);
                    } catch (e) {
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

    // Success Modal State
    const [showSuccess, setShowSuccess] = useState(false);

    const handleRun = async () => {
        setExecuting(true);
        setError('');
        setResult(null);
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/templates/${id}/run`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: userInputs })
            });

            const data = await res.json();

            if (res.status === 402) {
                setError("Insufficient credits to run this automation.");
                return;
            }

            if (!res.ok) throw new Error(data.detail || 'Execution failed');

            setResult(data);
            setShowSuccess(true); // Trigger success popup
        } catch (err: any) {
            setError(err.message);
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-500">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#FF4F00] border-t-transparent animate-spin"></div>
                Loading automation...
            </div>
        </div>
    );

    if (!template) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-500">Template not found.</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#2D2E2E]">
            {/* Success Popup */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border-t-4 border-green-500 transform transition-all scale-100">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            ✅
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Automation Started!</h3>
                        <p className="text-slate-500 mb-6 text-sm">
                            Your workflow has been successfully queued and is running in the background.
                        </p>
                        <div className="grid gap-3">
                            <Button
                                onClick={() => router.push('/automations')}
                                className="w-full bg-[#FF4F00] hover:bg-[#E64600] text-white font-bold h-12"
                            >
                                Track & View Results →
                            </Button>
                            <Button
                                onClick={() => setShowSuccess(false)}
                                variant="ghost"
                                className="w-full text-slate-400 font-normal"
                            >
                                Stay here
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-8 h-8 bg-[#FF4F00] rounded-lg"></div>
                        <span className="font-bold text-xl tracking-tight">FlowSaaS</span>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                        <Button variant="outline" onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 py-1 uppercase tracking-wide">
                                    {template.category || 'Utility'}
                                </Badge>
                                <Badge className={`border-none ${template.is_free ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#FF4F00]'}`}>
                                    {template.is_free ? 'FREE FOREVER' : `${template.credits_per_run} CREDITS`}
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-serif font-bold text-[#2D2E2E] mb-4">{template.name}</h1>
                            <p className="text-xl text-slate-500 font-light leading-relaxed">
                                {template.description}
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF4F00] font-bold">1</div>
                                Configure & Run
                            </h2>

                            {inputSchema.length > 0 ? (
                                <div className="space-y-6">
                                    {inputSchema.map((field: any) => (
                                        <div key={field.id} className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">{field.label}</Label>
                                            <Input
                                                type={field.type === 'password' ? 'password' : 'text'}
                                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                                                value={userInputs[field.label] || ''}
                                                onChange={(e: any) => setUserInputs({ ...userInputs, [field.label]: e.target.value })}
                                                className="bg-white border-slate-300 focus:border-[#FF4F00] focus:ring-[#FF4F00] h-12"
                                            />
                                            {field.type === 'credential' && (
                                                <p className="text-xs text-slate-400 italic">
                                                    Using secure credential storage.
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    <div className="pt-6">
                                        <Button
                                            className="w-full bg-[#FF4F00] hover:bg-[#E64600] h-14 text-lg font-bold shadow-lg shadow-orange-500/20"
                                            onClick={handleRun}
                                            disabled={executing}
                                        >
                                            {executing ? 'Initializing Workflow...' : `Run Automation ${template.is_free ? '' : `(${template.credits_per_run} Credits)`}`}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center py-6">
                                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-2">⚡</div>
                                    <p className="text-slate-500 max-w-md mx-auto">This automation is ready to run. It doesn't require any additional configuration.</p>
                                    <Button
                                        className="w-full bg-[#FF4F00] hover:bg-[#E64600] h-14 text-lg font-bold shadow-lg shadow-orange-500/20"
                                        onClick={handleRun}
                                        disabled={executing}
                                    >
                                        {executing ? 'Processing...' : 'Run Automation Now'}
                                    </Button>
                                </div>
                            )}

                            {error && (
                                <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm flex items-center gap-3">
                                    <span className="text-xl">⚠️</span> {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Panel Refined */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                            <p>Results will be available in the <strong>Automations Dashboard</strong> after execution completes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

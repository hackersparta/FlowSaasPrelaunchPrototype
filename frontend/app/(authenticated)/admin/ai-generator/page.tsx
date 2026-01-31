
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Bot,
    Sparkles,
    Save,
    Play,
    Code,
    CheckCircle,
    AlertCircle,
    Loader2,
    Cpu
} from "lucide-react";

export default function AIWorkflowGenerator() {
    const router = useRouter();

    // State
    const [providers, setProviders] = useState<string[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
    const [generatedSchema, setGeneratedSchema] = useState<any[]>([]);
    const [workflowName, setWorkflowName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch providers on mount
    useEffect(() => {
        const fetchProviders = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/ai/providers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProviders(data.providers || []);
                    if (data.providers?.length > 0) {
                        setSelectedProvider(data.providers[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch providers", err);
                // Fallback
                setProviders(["groq", "gemini"]);
                setSelectedProvider("groq");
            }
        };

        fetchProviders();
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedWorkflow(null);
        setGeneratedSchema([]);
        setSuccessMessage(null);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/ai/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    provider: selectedProvider
                })
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Critical: Backend returned non-JSON response:", text);
                throw new Error("The AI backend returned a malformed response. Please try a different prompt.");
            }

            if (!res.ok) {
                throw new Error(data.detail || "Generation failed");
            }

            setGeneratedWorkflow(data.workflow_json);
            setGeneratedSchema(data.input_schema || []);
            // Auto-suggest a name based on prompt (simple logic)
            setWorkflowName(prompt.split(' ').slice(0, 5).join(' ') + "...");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedWorkflow || !workflowName) return;

        setIsSaving(true);
        setError(null);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/ai/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: workflowName,
                    description: `Generated via ${selectedProvider} from prompt: "${prompt}"`,
                    workflow_json: generatedWorkflow,
                    input_schema: generatedSchema,
                    is_active: false // Saved as draft
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Failed to save workflow");
            }

            setSuccessMessage("Workflow saved! Redirecting to configuration page...");
            setTimeout(() => {
                router.push(`/admin/templates/${data.id}/edit`);
            }, 1000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const examplePrompts = [
        "Scrape TechCrunch RSS and post to Telegram",
        "Monitor BTC price every hour and email me if it drops below $50k",
        "Webhook receiver that adds leads to Google Sheets",
        "Summarize incoming emails using AI and Slack them"
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                            AI Workflow Generator
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Describe what you want, and let our AI agents build the connection.
                        </p>
                    </div>

                    {/* Provider Selector */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                        <Cpu className="w-5 h-5 text-gray-400 ml-2" />
                        <span className="text-sm font-medium text-gray-700">AI Provider:</span>
                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="bg-gray-50 border-none text-sm font-semibold text-indigo-600 focus:ring-0 cursor-pointer py-1 px-3 rounded-md hover:bg-indigo-50 transition-colors capitalize"
                        >
                            {providers.map(p => (
                                <option key={p} value={p} className="capitalize">{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Generator Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Input (1/3) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 space-y-4">
                                <label className="block text-sm font-medium text-gray-700 font-semibold">
                                    Describe your workflow
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g., When a new Stripe payment succeeds, send a Thank You email and add the customer to Airtable."
                                        className="w-full h-64 rounded-xl border-gray-200 bg-gray-50 p-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 resize-none transition-all shadow-inner text-base leading-relaxed"
                                    />
                                    <Bot className="absolute bottom-4 right-4 text-gray-300 w-6 h-6" />
                                </div>

                                {/* Example Chips */}
                                <div className="flex flex-wrap gap-2">
                                    {examplePrompts.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(p)}
                                            className="text-[10px] bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors border border-gray-200 font-medium"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt}
                                    className={`
                                        w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95
                                        ${isGenerating || !prompt
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                        }
                                    `}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Build Workflow
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error / Success Messages */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up shadow-sm">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up shadow-sm">
                                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm font-bold">{successMessage}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Columns: Previews (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {generatedWorkflow ? (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Workflow Block */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                            <div className="flex items-center gap-2">
                                                <Code className="w-5 h-5 text-gray-500" />
                                                <span className="font-bold text-sm text-gray-700 uppercase tracking-tight">Workflow JSON</span>
                                            </div>
                                            <div className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold border border-green-200">
                                                VALID N8N JSON
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
                                            <pre className="text-[11px] text-green-400 font-mono leading-relaxed">
                                                {JSON.stringify(generatedWorkflow, null, 2)}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* User Input Fields Block */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                            <div className="flex items-center gap-2">
                                                <Bot className="w-5 h-5 text-gray-500" />
                                                <span className="font-bold text-sm text-gray-700 uppercase tracking-tight">Detected User Inputs</span>
                                            </div>
                                            <div className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold border border-indigo-200">
                                                SMART DETECTION
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                            {generatedSchema.length > 0 ? (
                                                generatedSchema.map((field, idx) => (
                                                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-gray-500 uppercase">{field.type} Field</span>
                                                            <span className="text-[10px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md font-mono border border-indigo-100">{field.placeholder}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900">{field.label}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                                                    <Bot className="w-12 h-12 mb-3" />
                                                    <p className="text-sm font-medium">No input fields detected for this workflow.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Action Bar */}
                                <div className="bg-indigo-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100 border border-indigo-800">
                                    <div className="flex-1 w-full">
                                        <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-2 tracking-widest">
                                            Name your automation
                                        </label>
                                        <input
                                            type="text"
                                            value={workflowName}
                                            onChange={(e) => setWorkflowName(e.target.value)}
                                            placeholder="Enter workflow name..."
                                            className="w-full bg-indigo-950/50 border-indigo-700 text-white placeholder-indigo-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-semibold"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="whitespace-nowrap flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-900 rounded-xl hover:bg-indigo-50 transition-all font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Finalizing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                Save and Configure Details
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Empty State
                            <div className="h-full min-h-[500px] rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-white/50 backdrop-blur-sm shadow-inner">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                                    <Play className="w-10 h-10 text-indigo-300 ml-1" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900">Blueprint Ready</h3>
                                    <p className="text-gray-500 max-w-sm text-sm">
                                        Once generated, you&apos;ll see the n8n logic and user registration fields here.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

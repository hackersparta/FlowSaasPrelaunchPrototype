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
    Cpu,
    Terminal,
    Zap
} from "lucide-react";

export default function AIToolGenerator() {
    const router = useRouter();

    // State
    const [providers, setProviders] = useState<string[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTesting, setIsTesting] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Generated data
    const [generatedCode, setGeneratedCode] = useState("");
    const [metadata, setMetadata] = useState<any>(null);
    const [inputSchema, setInputSchema] = useState<any[]>([]);
    const [testCases, setTestCases] = useState<any[]>([]);
    const [dependencies, setDependencies] = useState<string[]>([]);
    const [testResults, setTestResults] = useState<{ [key: number]: any }>({});

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch providers on mount
    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/ai-tools/providers`, {
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
            setProviders(["groq", "gemini"]);
            setSelectedProvider("groq");
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedCode("");
        setMetadata(null);
        setInputSchema([]);
        setTestCases([]);
        setDependencies([]);
        setTestResults({});
        setSuccessMessage(null);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/ai-tools/generate`, {
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

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Generation failed");
            }

            setGeneratedCode(data.python_code || "");
            setMetadata(data.metadata || {});
            setInputSchema(data.input_schema || []);
            setTestCases(data.test_cases || []);
            setDependencies(data.dependencies || []);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRunTest = async (testCase: any, index: number) => {
        setIsTesting(index);
        setError(null);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/ai-tools/test`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    python_code: generatedCode,
                    test_inputs: testCase.inputs || { input_data: testCase.input }
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Test failed");
            }

            setTestResults(prev => ({
                ...prev,
                [index]: data
            }));

        } catch (err: any) {
            setTestResults(prev => ({
                ...prev,
                [index]: { success: false, error: err.message }
            }));
        } finally {
            setIsTesting(null);
        }
    };

    const handleSave = async () => {
        if (!generatedCode || !metadata) return;

        setIsSaving(true);
        setError(null);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/ai-tools/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: metadata.name,
                    slug: metadata.slug,
                    description: metadata.description,
                    category: metadata.category,
                    icon: metadata.icon,
                    input_type: metadata.input_type || "multiple",
                    output_type: metadata.output_type,
                    python_code: generatedCode,
                    input_schema: inputSchema
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Failed to save tool");
            }

            setSuccessMessage("Tool saved! Redirecting to tool management...");
            setTimeout(() => {
                router.push('/admin/tools');
            }, 1000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const examplePrompts = [
        "JSON formatter with validation",
        "UUID generator v4",
        "Base64 encoder/decoder",
        "Password strength checker",
        "Markdown to HTML converter"
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Zap className="w-8 h-8 text-purple-600" />
                            AI Tool Generator
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Describe your tool, and AI will generate production-ready Python code.
                        </p>
                    </div>

                    {/* Provider Selector */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                        <Cpu className="w-5 h-5 text-gray-400 ml-2" />
                        <span className="text-sm font-medium text-gray-700">AI Provider:</span>
                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="bg-gray-50 border-none text-sm font-semibold text-purple-600 focus:ring-0 cursor-pointer py-1 px-3 rounded-md hover:bg-purple-50 transition-colors capitalize"
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
                                    Describe your tool
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g., Create a JSON formatter that validates and beautifies JSON with syntax highlighting"
                                        className="w-full h-64 rounded-xl border-gray-200 bg-gray-50 p-4 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 resize-none transition-all shadow-inner text-base leading-relaxed"
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
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-200'
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
                                            Generate Tool
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
                            <div className="bg-purple-50 border border-purple-200 text-purple-700 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up shadow-sm">
                                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <p className="text-sm font-bold">{successMessage}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Columns: Previews (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {generatedCode ? (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Code and Metadata  */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Python Code Block */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                            <div className="flex items-center gap-2">
                                                <Terminal className="w-5 h-5 text-gray-500" />
                                                <span className="font-bold text-sm text-gray-700 uppercase tracking-tight">Python Code</span>
                                            </div>
                                            <div className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold border border-green-200">
                                                READY TO TEST
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
                                            <pre className="text-[11px] text-green-400 font-mono leading-relaxed">
                                                {generatedCode}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Metadata Block */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                            <div className="flex items-center gap-2">
                                                <Code className="w-5 h-5 text-gray-500" />
                                                <span className="font-bold text-sm text-gray-700 uppercase tracking-tight">Tool Metadata</span>
                                            </div>
                                            <div className="text-[10px] px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold border border-purple-200">
                                                AUTO-GENERATED
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                            {metadata && (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                                        <p className="text-sm font-semibold text-gray-900">{metadata.name}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Slug</label>
                                                        <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">{metadata.slug}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                                        <p className="text-sm text-gray-700">{metadata.description}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                                            <p className="text-sm text-purple-600 font-semibold">{metadata.category}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase">Icon</label>
                                                            <p className="text-2xl">{metadata.icon}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase">Input Mode</label>
                                                            <p className="text-sm text-gray-600 capitalize">{metadata.input_type === 'multiple' || inputSchema.length > 1 ? 'Multi-Input' : metadata.input_type}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase">Output Type</label>
                                                            <p className="text-sm text-gray-600 capitalize">{metadata.output_type}</p>
                                                        </div>
                                                    </div>
                                                    {inputSchema.length > 0 && (
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase">Input Schema</label>
                                                            <div className="space-y-2">
                                                                {inputSchema.map((field, i) => (
                                                                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border border-gray-100">
                                                                        <span className="font-bold text-gray-700">{field.name}</span>
                                                                        <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{field.type}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {dependencies.length > 0 && (
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase">Dependencies</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {dependencies.map((dep, i) => (
                                                                    <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200 font-medium">
                                                                        {dep}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Test Cases */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50/80">
                                        <div className="flex items-center gap-2">
                                            <Play className="w-5 h-5 text-gray-500" />
                                            <span className="font-bold text-sm text-gray-700 uppercase tracking-tight">Test Cases</span>
                                            <span className="text-xs text-gray-500">({testCases.length} tests)</span>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {testCases.map((testCase, idx) => {
                                            const result = testResults[idx];
                                            return (
                                                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Test #{idx + 1}</p>
                                                            <pre className="text-[10px] font-mono text-gray-700 bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                                                                {JSON.stringify(testCase.inputs || { input_data: testCase.input }, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRunTest(testCase, idx)}
                                                            disabled={isTesting === idx}
                                                            className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold transition-all shadow-sm"
                                                        >
                                                            {isTesting === idx ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    Testing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Play className="w-4 h-4" />
                                                                    Run
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    {result && (
                                                        <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {result.success ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                ) : (
                                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                                )}
                                                                <span className={`text-xs font-bold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                                                    {result.success ? 'PASSED' : 'FAILED'}
                                                                </span>
                                                            </div>
                                                            <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                                                                {result.success ? JSON.stringify(result.result, null, 2) : result.error}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Save Action Bar */}
                                <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-purple-100 border border-purple-800">
                                    <div className="flex-1">
                                        <p className="text-purple-200 text-sm font-semibold mb-1">Ready to deploy?</p>
                                        <p className="text-white text-lg font-bold">{metadata?.name}</p>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="whitespace-nowrap flex items-center justify-center gap-3 px-8 py-4 bg-white text-purple-900 rounded-xl hover:bg-purple-50 transition-all font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                Save Tool
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Empty State
                            <div className="h-full min-h-[500px] rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-white/50 backdrop-blur-sm shadow-inner">
                                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center animate-pulse">
                                    <Zap className="w-10 h-10 text-purple-300" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900">Tool Code Ready</h3>
                                    <p className="text-gray-500 max-w-sm text-sm">
                                        Once generated, you'll see the Python code, metadata, and test cases here.
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

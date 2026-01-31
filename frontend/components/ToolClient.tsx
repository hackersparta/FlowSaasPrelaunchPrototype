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
    input_type: string;
    output_type: string;
    input_schema?: string;
    usage_count: number;
    content_json?: string;
}

interface ToolClientProps {
    slug: string;
}

export default function ToolClient({ slug }: ToolClientProps) {
    const router = useRouter();
    const [tool, setTool] = useState<Tool | null>(null);
    const [inputData, setInputData] = useState<any>({});
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch tool details
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tools/${slug}`)
            .then(res => res.json())
            .then(data => {
                setTool(data);

                // Initialize default values
                const defaults: any = {};

                // 1. Try input_schema (new structured AI generated)
                if (data.input_schema) {
                    try {
                        const schema = JSON.parse(data.input_schema);
                        if (Array.isArray(schema)) {
                            schema.forEach((field: any) => {
                                if (field.default !== undefined) defaults[field.name] = field.default;
                            });
                        }
                    } catch (e) { }
                }

                // 2. Try content_json (legacy manual/workflow tools)
                if (data.content_json && Object.keys(defaults).length === 0) {
                    try {
                        const content = JSON.parse(data.content_json);
                        if (content.inputs) {
                            content.inputs.forEach((i: any) => {
                                if (i.defaultValue) defaults[i.name] = i.defaultValue;
                            });
                        }
                    } catch (e) { }
                }

                setInputData(defaults);
            })
            .catch(err => console.error('Failed to load tool:', err));
    }, [slug]);

    const executeTool = async () => {
        setLoading(true);
        setError('');
        setOutput('');

        try {
            let response;
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            // Detect if we have file inputs
            const hasFiles = Object.values(inputData).some(v => v instanceof File || (Array.isArray(v) && v[0] instanceof File));

            if (hasFiles) {
                const formData = new FormData();

                // For backend compatibility, find the first file and name it 'file'
                // ONLY for legacy tools (no input_schema)
                let fileAppended = false;
                Object.keys(inputData).forEach(k => {
                    const val = inputData[k];
                    if (val instanceof File) {
                        if (!fileAppended && !tool?.input_schema) {
                            formData.append('file', val);
                            fileAppended = true;
                        } else {
                            formData.append(k, val);
                        }
                    } else if (val !== undefined && val !== null) {
                        if (val instanceof File) {
                            if (!fileAppended && !tool?.input_schema) {
                                formData.append('file', val);
                                fileAppended = true;
                            } else {
                                formData.append(k, val);
                            }
                        } else if (val !== undefined && val !== null) {
                            formData.append(k, String(val));
                        }
                    }
                });

                response = await fetch(`${apiBase}/tools/${slug}/execute-file`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Regular JSON request
                response = await fetch(`${apiBase}/tools/${slug}/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputData)
                });
            }

            const result = await response.json();

            if (result.success) {
                setOutput(typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2));
            } else {
                setError(result.error || 'Execution failed');
            }
        } catch (err) {
            setError('Failed to execute tool');
        } finally {
            setLoading(false);
        }
    };

    if (!tool) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div>Loading tool...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/tools')}
                    className="mb-6 text-slate-400 hover:text-white"
                >
                    ← Back to Tools
                </Button>

                {/* Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": tool.name,
                            "description": tool.description,
                            "applicationCategory": tool.category,
                            "operatingSystem": "Web",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "4.8",
                                "ratingCount": tool.usage_count > 0 ? tool.usage_count : 1
                            }
                        })
                    }}
                />

                {/* Tool Header */}
                <div className="mb-8">
                    <div className="text-6xl mb-4">{tool.icon}</div>
                    <h1 className="text-4xl font-bold mb-3">{tool.name}</h1>
                    <p className="text-xl text-slate-400 mb-4">{tool.description}</p>
                    <div className="flex gap-3 text-sm">
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full">
                            {tool.category}
                        </span>
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full">
                            {tool.usage_count} uses
                        </span>
                    </div>
                </div>

                {/* Tool Interface */}
                <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 mb-8">
                    {/* Dynamic Inputs */}
                    {(() => {
                        let inputs: any[] = [];

                        // 1. Try input_schema (Priority - AI Generated Multi-Input)
                        if (tool.input_schema) {
                            try {
                                const schema = JSON.parse(tool.input_schema);
                                if (Array.isArray(schema)) {
                                    inputs = schema.map(f => ({
                                        name: f.name,
                                        label: f.label || f.name,
                                        type: f.type,
                                        placeholder: f.placeholder || f.description,
                                        required: f.required,
                                        options: f.options, // for select
                                        defaultValue: f.default
                                    }));
                                }
                            } catch (e) { }
                        }

                        // 2. Try content_json (Workflow Tools)
                        if (inputs.length === 0) {
                            try {
                                const content = typeof tool.content_json === 'string' ? JSON.parse(tool.content_json) : tool.content_json;
                                if (content?.inputs) {
                                    inputs = content.inputs;
                                }
                            } catch (e) { }
                        }

                        // 3. Fallback to legacy input_type
                        if (inputs.length === 0) {
                            if (tool.input_type === 'text') {
                                inputs.push({ name: 'input_data', label: 'Input Text', type: 'textarea', placeholder: 'Enter text here...' });
                            } else if (tool.input_type === 'file') {
                                inputs.push({ name: 'file', label: 'Upload File', type: 'file' });
                            } else if (tool.input_type === 'files') {
                                inputs.push({ name: 'files', label: 'Upload Files', type: 'file', multiple: true });
                            }

                            // Legacy extras
                            if (tool.slug.includes('base64') || tool.slug.includes('url')) {
                                inputs.push({
                                    name: 'mode',
                                    label: 'Mode',
                                    type: 'select',
                                    options: [
                                        { label: 'Encode', value: 'encode' },
                                        { label: 'Decode', value: 'decode' }
                                    ],
                                    defaultValue: 'encode'
                                });
                            }
                            if (tool.slug.includes('hash')) {
                                inputs.push({
                                    name: 'algorithm',
                                    label: 'Algorithm',
                                    type: 'select',
                                    options: [
                                        { label: 'MD5', value: 'md5' },
                                        { label: 'SHA256', value: 'sha256' },
                                        { label: 'SHA512', value: 'sha512' }
                                    ],
                                    defaultValue: 'sha256'
                                });
                            }
                        }

                        return inputs.map((field: any, idx: number) => (
                            <div key={idx} className="mb-6">
                                <label className="block text-sm font-medium mb-2">{field.label}</label>

                                {field.type === 'textarea' && (
                                    <textarea
                                        value={inputData[field.name] || ''}
                                        onChange={(e) => setInputData({ ...inputData, [field.name]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full h-40 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                                    />
                                )}

                                {field.type === 'text' && (
                                    <input
                                        type="text"
                                        value={inputData[field.name] || ''}
                                        onChange={(e) => setInputData({ ...inputData, [field.name]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                )}

                                {field.type === 'number' && (
                                    <input
                                        type="number"
                                        value={inputData[field.name] || field.defaultValue || ''}
                                        onChange={(e) => setInputData({ ...inputData, [field.name]: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                )}

                                {field.type === 'file' && (
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setInputData({ ...inputData, [field.name]: file });
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                    />
                                )}

                                {field.type === 'select' && (
                                    <div className="flex gap-3">
                                        {field.options.map((opt: any) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setInputData({ ...inputData, [field.name]: opt.value })}
                                                className={`px-6 py-2 rounded-lg transition-colors ${(inputData[field.name] || field.defaultValue) === opt.value
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ));
                    })()}

                    {/* Execute Button */}
                    <Button
                        onClick={executeTool}
                        disabled={loading || Object.keys(inputData).length === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg mb-6"
                    >
                        {loading ? 'Processing...' : `${tool.name.includes('Generator') ? 'Generate' : 'Convert'}`}
                    </Button>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Output Section */}
                    {output && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Output</label>

                            {tool.output_type === 'file' ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
                                        <span className="text-slate-300">Processing Complete</span>
                                        <Button
                                            onClick={() => {
                                                let downloadUrl;
                                                let fileName = `output_${Date.now()}.bin`;

                                                try {
                                                    // Parse the output string to get the result object
                                                    const parsed = typeof output === 'string' ? JSON.parse(output) : output;

                                                    // The result should have output, filename, and mime_type at top level
                                                    if (parsed.output && parsed.filename) {
                                                        fileName = parsed.filename;
                                                        const mimeType = parsed.mime_type || 'application/octet-stream';
                                                        downloadUrl = `data:${mimeType};base64,${parsed.output}`;
                                                    }
                                                    // Or nested inside an output property
                                                    else if (parsed.output && typeof parsed.output === 'object') {
                                                        const inner = parsed.output;
                                                        if (inner.output && inner.filename) {
                                                            fileName = inner.filename;
                                                            const mimeType = inner.mime_type || 'application/octet-stream';
                                                            downloadUrl = `data:${mimeType};base64,${inner.output}`;
                                                        }
                                                    }
                                                    // Fallback: raw base64
                                                    if (!downloadUrl) {
                                                        const data = typeof parsed === 'string' ? parsed : (parsed.output || output);
                                                        downloadUrl = `data:application/octet-stream;base64,${data}`;
                                                    }
                                                } catch (e) {
                                                    downloadUrl = `data:application/octet-stream;base64,${output}`;
                                                }

                                                const link = document.createElement('a');
                                                link.href = downloadUrl;
                                                link.download = fileName;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            Download File
                                        </Button>
                                    </div>

                                    {/* Preview if image */}
                                    {(tool.slug.includes('image') || tool.slug.includes('qrcode')) && (
                                        <div className="mt-4 flex justify-center bg-slate-800/50 p-4 rounded-lg">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`data:image/png;base64,${(() => {
                                                    try {
                                                        const j = JSON.parse(output);
                                                        return j.output || output;
                                                    } catch { return output; }
                                                })()}`}
                                                className="max-h-64 rounded shadow-lg"
                                                alt="Result Preview"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        value={output}
                                        readOnly
                                        className="w-full h-40 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm"
                                    />
                                    <Button
                                        onClick={() => navigator.clipboard.writeText(output)}
                                        variant="outline"
                                        className="mt-3 border-blue-500 text-blue-400 hover:bg-blue-950"
                                    >
                                        Copy to Clipboard
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Rich Content Sections */}
            {tool.content_json && (() => {
                let content: any = {};
                try {
                    content = typeof tool.content_json === 'string' ? JSON.parse(tool.content_json) : tool.content_json;
                } catch (e) {
                    return null;
                }

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {/* Left Col: Features & How To */}
                        <div className="space-y-8">
                            {content.features && content.features.length > 0 && (
                                <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <span className="text-blue-500">✨</span> Key Features
                                    </h2>
                                    <ul className="space-y-4">
                                        {content.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className="min-w-[20px] pt-1">
                                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">
                                                        ✓
                                                    </div>
                                                </div>
                                                <span className="text-slate-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {content.how_to && content.how_to.length > 0 && (
                                <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <span className="text-emerald-500">📝</span> How to Use
                                    </h2>
                                    <div className="space-y-6">
                                        {content.how_to.map((step: string, idx: number) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="flex-none">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono">
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                                <p className="pt-1 text-slate-300">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Col: FAQs & Pain Point */}
                        <div className="space-y-8">
                            {content.faqs && content.faqs.length > 0 && (
                                <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <span className="text-purple-500">❓</span> Common Questions
                                    </h2>
                                    <div className="space-y-4">
                                        {content.faqs.map((faq: any, idx: number) => (
                                            <div key={idx} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                                                <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {content.pain_point && (
                                <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 p-8 rounded-2xl border border-red-900/30">
                                    <h3 className="text-lg font-bold text-red-200 mb-2">😩 The Problem</h3>
                                    <p className="text-slate-400 italic mb-6">&quot;{content.pain_point}&quot;</p>

                                    <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-6 rounded-xl border border-emerald-900/30">
                                        <h3 className="text-lg font-bold text-emerald-200 mb-2">🚀 The Solution</h3>
                                        <p className="text-slate-300">{content.solution}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-8 rounded-xl border border-blue-800/50 text-center mb-8">
                <h2 className="text-2xl font-bold mb-3">Need to Automate This?</h2>
                <p className="text-slate-300 mb-4">
                    Use our workflow automation to run this tool automatically on a schedule or trigger.
                </p>
                <Button
                    onClick={() => router.push('/marketplace')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Browse Automation Workflows
                </Button>
            </div>

            {/* Social Share & Branding */}
            <div className="text-center border-t border-slate-800 pt-8">
                <p className="text-slate-400 mb-4">Share this free tool</p>
                <div className="flex justify-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this free ${tool.name} tool!&url=${window.location.href}`, '_blank')}
                        className="border-slate-700 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]"
                    >
                        Twitter
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}
                        className="border-slate-700 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]"
                    >
                        LinkedIn
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                        className="border-slate-700 hover:bg-[#4267B2] hover:text-white hover:border-[#4267B2]"
                    >
                        Facebook
                    </Button>
                </div>
                <p className="text-sm text-slate-500">
                    Made with <span className="text-blue-400 font-semibold">FlowSaaS</span> • Free Tools for Everyone
                </p>
            </div>
        </div>

    );
}

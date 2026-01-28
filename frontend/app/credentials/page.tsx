'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CredentialVault() {
    const router = useRouter();
    // Mock data for UI demo
    const [creds, setCreds] = useState([
        { id: '1', name: 'My OpenAI Key', type: 'OpenAI', created: '2024-01-15' },
        { id: '2', name: 'Company Slack', type: 'Slack', created: '2024-01-18' }
    ]);

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold">Credential Vault</h1>
                        <p className="text-slate-400 mt-2">
                            Securely manage secrets. Encrypted with AES-256 before storage.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                </header>

                <div className="bg-slate-900/30 border border-dashed border-slate-700 rounded-xl p-8 mb-12 text-center">
                    <h3 className="text-lg font-medium mb-2">Add New Connection</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Connect external services to FlowSaaS. keys are never shown again after saving.
                    </p>
                    <div className="flex gap-4 max-w-md mx-auto">
                        <Input placeholder="Credential Name (e.g. My Telegram)" />
                        <Button>Connect</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {creds.map(c => (
                        <div key={c.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                                    🔑
                                </div>
                                <div>
                                    <h4 className="font-bold">{c.name}</h4>
                                    <p className="text-xs text-slate-500 uppercase">{c.type} • Added {c.created}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">Revoke</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

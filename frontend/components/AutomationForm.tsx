// frontend/components/AutomationForm.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/button';

interface AutomationFormProps {
    automationType: string;
    toolName: string;
    creditsRequired?: number;
}

export default function AutomationForm({
    automationType,
    toolName,
    creditsRequired = 5
}: AutomationFormProps) {
    const [inputMethod, setInputMethod] = useState('cloud_link');
    const [inputUrl, setInputUrl] = useState('');
    const [outputMethod, setOutputMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [schedule, setSchedule] = useState('once');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to run automations');
                return;
            }

            const res = await fetch('http://localhost:8000/automations/run', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    automation_type: automationType,
                    input_method: inputMethod,
                    input_url: inputUrl,
                    output_method: outputMethod,
                    output_email: email,
                    schedule_type: schedule
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Failed to start automation');
            }

            const data = await res.json();
            setResult(data);

            if (schedule === 'once') {
                alert('✅ Automation started! Check your email or dashboard for results.');
            } else {
                alert(`✅ Automation scheduled! Will run ${schedule}.`);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">⚙️ Setup & Run</h3>

            {/* Input Source */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Input Source
                </label>
                <select
                    value={inputMethod}
                    onChange={(e) => setInputMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                    <option value="cloud_link">Cloud Storage Link (Google Drive, Dropbox)</option>
                    <option value="upload">Upload File (Coming Soon)</option>
                </select>
            </div>

            {/* Cloud Link Input */}
            {inputMethod === 'cloud_link' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        File Link
                    </label>
                    <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/ABC123/view"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Make sure the link is publicly accessible (anyone with link can view)
                    </p>
                </div>
            )}

            {/* Output Method */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Deliver Results
                </label>
                <select
                    value={outputMethod}
                    onChange={(e) => setOutputMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                    <option value="email">📧 Email Me</option>
                    <option value="dashboard">📊 View in Dashboard</option>
                </select>
            </div>

            {/* Email Input */}
            {outputMethod === 'email' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                    />
                </div>
            )}

            {/* Schedule */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Schedule
                </label>
                <select
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                    <option value="once">⚡ Run Once (Now)</option>
                    <option value="daily">📅 Daily at 9 AM</option>
                    <option value="weekly">📆 Weekly (Mondays)</option>
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={loading || !inputUrl || (outputMethod === 'email' && !email)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? '⏳ Processing...' : `🚀 Run Automation (${creditsRequired} Credits)`}
            </Button>

            {/* Result */}
            {result && (
                <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-sm">
                    ✅ Automation created successfully!
                    {schedule === 'once' && ' Processing now...'}
                    <br />
                    <a href="/automations" className="underline mt-2 inline-block">
                        View in Dashboard →
                    </a>
                </div>
            )}
        </div>
    );
}

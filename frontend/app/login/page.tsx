'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: email, password: password }),
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F5] p-4">
            <div className="mb-8 text-center cursor-pointer" onClick={() => router.push('/')}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-[#FF4F00] rounded-lg shadow-sm"></div>
                </div>
                <h1 className="text-2xl font-bold text-[#2D2E2E]">FlowSaaS</h1>
            </div>

            <div className="w-full max-w-md bg-white p-10 rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif font-medium text-[#2D2E2E]">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-slate-500">
                        Sign in to continue automating
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 border-slate-300 focus:border-[#FF4F00] focus:ring-[#FF4F00]"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-sm text-[#FF4F00] hover:underline">Forgot password?</a>
                            </div>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 border-slate-300 focus:border-[#FF4F00] focus:ring-[#FF4F00]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-semibold bg-[#FF4F00] hover:bg-[#E64600] shadow-lg shadow-orange-500/20"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Log in'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-8 text-center text-slate-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[#FF4F00] font-semibold hover:underline">
                    Sign up for free
                </Link>
            </div>
        </div>
    );
}

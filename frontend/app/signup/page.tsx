'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Signup failed');
            }

            // Auto login after signup
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: email, password: password }),
            });

            const data = await loginRes.json();
            localStorage.setItem('token', data.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
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
                        Get started free
                    </h2>
                    <p className="mt-2 text-slate-500">
                        No credit card required. Cancel anytime.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSignup}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Work Email</label>
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
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                            <Input
                                type="password"
                                placeholder="Create a password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 border-slate-300 focus:border-[#FF4F00] focus:ring-[#FF4F00]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="text-xs text-slate-500 text-center leading-relaxed">
                        By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-semibold bg-[#FF4F00] hover:bg-[#E64600] shadow-lg shadow-orange-500/20"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </div>
                </form>
            </div>
            <div className="mt-8 text-center text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[#FF4F00] font-semibold hover:underline">
                    Log in
                </Link>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Check, Info } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Configuration for Slider Steps
const SLIDER_STEPS = [
    { credits: 100, label: '100', tier: 'Free' },
    { credits: 500, label: '500', tier: 'Professional' },
    { credits: 800, label: '800', tier: 'Professional' },
    { credits: 1000, label: '1,000', tier: 'Professional' },
    { credits: 2500, label: '2,500', tier: 'Team' },
    { credits: 5000, label: '5,000', tier: 'Team' },
];

// Feature list mapping
const TIER_FEATURES: Record<string, string[]> = {
    'Free': [
        '100 tasks/month',
        'Single-step workflows',
        'Basic app integrations',
        '15-minute update time'
    ],
    'Professional': [
        'Unlock full automation power',
        'Multi-step workflows',
        'Unlimited Premium apps',
        'Webhooks',
        '3-minute update time',
        'Conditional logic'
    ],
    'Team': [
        'Collaborate with your team',
        'Unlimited users',
        'Shared workspace',
        'Premier Support',
        'Shared app connections',
        '1-minute update time'
    ],
    'Enterprise': [
        'Scale across organization',
        'Advanced security & SSO',
        'Unlimited history',
        'Designated CSM',
        'Custom retention',
        'SLA'
    ]
};

export default function CreditsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    // Slider state: index of SLIDER_STEPS
    const [sliderIndex, setSliderIndex] = useState(1); // Default to 500 (Index 1)

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch user info
        fetch('http://localhost:8000/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(() => router.push('/login'));

        // Fetch packages
        fetch('http://localhost:8000/payments/packages')
            .then(res => res.json())
            .then(data => {
                const sorted = (data.packages || []).sort((a: any, b: any) => a.price - b.price);
                setPackages(sorted);
            })
            .catch(err => console.error("Failed to load packages:", err));

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, [router]);

    const handlePurchase = async (packageId: string) => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            // Create order
            const orderRes = await fetch('http://localhost:8000/payments/create-order', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ package_id: packageId })
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok || !orderData.order_id) {
                alert(`Failed to create order: ${orderData.detail || 'Unknown error'}`);
                setLoading(false);
                return;
            }

            // Open Razorpay checkout
            const options = {
                key: 'rzp_test_S8FZBnr4Ocgdp',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'FlowSaaS Credits',
                description: `${orderData.credits} Credits`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    const verifyRes = await fetch('http://localhost:8000/payments/verify', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            credits: orderData.credits
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        alert(`Success! ${verifyData.credits_added} credits added. New balance: ${verifyData.new_balance}`);
                        router.push('/dashboard');
                    } else {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    email: user?.email || ''
                },
                theme: {
                    color: '#FF4F00'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    // --- Helper Logic for Display ---

    const currentStep = SLIDER_STEPS[sliderIndex];

    // Find the package that matches the current slider selection (by credits)
    // If exact match not found, find closest >= credits
    const activePackage = useMemo(() => {
        if (!packages.length) return null;
        return packages.find(p => p.credits >= currentStep.credits) || packages[packages.length - 1];
    }, [packages, currentStep]);

    // Calculate display prices
    // We assume backend is in INR. We convert to USD roughly for display.
    // 1 USD ~ 85 INR (Example rate for display) or use user's fixed points ($5/500, $8/800)
    const getDisplayPrice = (credits: number, inrPrice: number) => {
        if (credits === 100) return { usd: 0, inr: 0 };

        // Custom logic based on user request
        if (credits === 500) return { usd: 5, inr: inrPrice }; // User said $5 for 500
        if (credits === 800) return { usd: 8, inr: inrPrice }; // User said $8 for 800
        if (credits === 1000) return { usd: 12, inr: inrPrice }; // Extrapolated
        if (credits === 2500) return { usd: 25, inr: inrPrice }; // Extrapolated
        if (credits === 5000) return { usd: 45, inr: inrPrice }; // Extrapolated

        // Fallback calculation
        return { usd: Math.floor(inrPrice / 85), inr: inrPrice };
    };

    const displayPrice = activePackage
        ? getDisplayPrice(activePackage.credits, activePackage.price)
        : { usd: 0, inr: 0 };


    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF8] text-slate-500">
            <div className="animate-pulse">Loading plans...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FFFBF8] text-[#2D2E2E] font-sans">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-16 text-center">
                    <h1 className="text-5xl font-bold mb-6 text-[#2D2E2E] tracking-tight">Plans & Pricing</h1>

                    {/* Slider Section */}
                    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
                        <div className="flex items-center gap-3 mb-6 justify-center">
                            <span className="text-lg font-medium text-slate-600">I need</span>
                            <span className="bg-[#FF4F00] text-white px-4 py-1 rounded-full font-bold text-lg shadow-sm">
                                {currentStep.label}
                            </span>
                            <span className="text-lg font-medium text-slate-600">tasks per month</span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max={SLIDER_STEPS.length - 1}
                            step="1"
                            value={sliderIndex}
                            onChange={(e) => setSliderIndex(parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF4F00] hover:accent-[#E04600] transition-all"
                        />
                        <div className="flex justify-between mt-3 px-1 text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {SLIDER_STEPS.map((s, i) => (
                                <span key={i} className={i === sliderIndex ? 'text-[#FF4F00] font-bold' : ''}>{s.label}</span>
                            ))}
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-[#2D2E2E]' : 'text-slate-500'}`}>Pay monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className={`w-12 h-6 rounded-full relative transition-colors ${billingCycle === 'yearly' ? 'bg-[#FF4F00]' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${billingCycle === 'yearly' ? 'left-7' : 'left-1'}`} />
                        </button>
                        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-[#2D2E2E]' : 'text-slate-500'}`}>
                            Pay yearly <span className="text-[#FF4F00] font-bold text-xs ml-1">(Save 33%)</span>
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">

                    {/* 1. Free Plan */}
                    <div className={`
                        relative bg-white p-6 rounded-xl border flex flex-col h-full transition-all duration-300
                        ${currentStep.tier === 'Free' ? 'border-[#FF4F00] shadow-xl scale-105 z-10' : 'border-slate-200 hover:shadow-lg'}
                    `}>
                        <div className="mb-6">
                            <h3 className="font-bold text-2xl mb-2 text-[#2D2E2E]">Free</h3>
                            <p className="text-sm text-slate-500 min-h-[40px] leading-snug">
                                For individuals exploring automation.
                            </p>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold tracking-tight text-[#2D2E2E]">$0</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <div className="text-sm text-slate-400 font-medium mt-1">Free forever</div>
                        </div>
                        <Button className="w-full mb-8 font-semibold py-6 bg-[#2D2E2E] hover:bg-slate-800 text-white">
                            Get Started
                        </Button>
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-[#2D2E2E]">Free features:</p>
                            <ul className="space-y-3">
                                {TIER_FEATURES['Free'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-[#FF4F00] flex-shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 2. Professional Plan */}
                    <div className={`
                        relative bg-white p-6 rounded-xl border flex flex-col h-full transition-all duration-300
                        ${currentStep.tier === 'Professional' ? 'border-[#FF4F00] shadow-xl scale-105 z-10' : 'border-slate-200 hover:shadow-lg'}
                    `}>
                        {currentStep.tier === 'Professional' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF4F00] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                RECOMMENDED
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="font-bold text-2xl mb-2 text-[#2D2E2E]">Professional</h3>
                            <p className="text-sm text-slate-500 min-h-[40px] leading-snug">
                                For individuals and professionals building workflows.
                            </p>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold tracking-tight text-[#2D2E2E]">
                                    ${displayPrice.usd.toFixed(2)}
                                </span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <div className="text-sm text-slate-400 font-medium mt-1">
                                approx ₹{displayPrice.inr.toLocaleString()}
                            </div>
                            <div className="text-xs text-[#FF4F00] mt-2 font-semibold">
                                Billed {billingCycle}
                            </div>
                        </div>
                        <Button
                            className="w-full mb-8 font-semibold py-6 bg-[#FF4F00] hover:bg-[#E04600] text-white shadow-md shadow-orange-200"
                            onClick={() => activePackage && handlePurchase(activePackage.id)}
                            disabled={loading || !activePackage}
                        >
                            {loading ? 'Processing...' : 'Try it free →'}
                        </Button>
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-[#2D2E2E]">Professional features:</p>
                            <ul className="space-y-3">
                                {TIER_FEATURES['Professional'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-[#FF4F00] flex-shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 3. Team Plan */}
                    <div className={`
                        relative bg-white p-6 rounded-xl border flex flex-col h-full transition-all duration-300
                        ${currentStep.tier === 'Team' ? 'border-[#FF4F00] shadow-xl scale-105 z-10' : 'border-slate-200 hover:shadow-lg'}
                    `}>
                        <div className="mb-6">
                            <h3 className="font-bold text-2xl mb-2 text-[#2D2E2E]">Team</h3>
                            <p className="text-sm text-slate-500 min-h-[40px] leading-snug">
                                Collaborate with your team to build systems.
                            </p>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold tracking-tight text-[#2D2E2E]">
                                    {currentStep.tier === 'Team' ? `$${displayPrice.usd.toFixed(2)}` : '$29.99'}
                                </span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            {currentStep.tier === 'Team' && (
                                <div className="text-sm text-slate-400 font-medium mt-1">
                                    approx ₹{displayPrice.inr.toLocaleString()}
                                </div>
                            )}
                            <div className="text-xs text-slate-400 mt-2">
                                Starts at 2.5K tasks
                            </div>
                        </div>
                        <Button
                            className={`w-full mb-8 font-semibold py-6 ${currentStep.tier === 'Team' ? 'bg-[#FF4F00] text-white' : 'bg-[#2D2E2E] text-white hover:bg-slate-800'}`}
                            onClick={() => activePackage && handlePurchase(activePackage.id)}
                            disabled={currentStep.tier !== 'Team'}
                        >
                            {currentStep.tier === 'Team' ? 'Try it free →' : 'Upgrade to Team'}
                        </Button>
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-[#2D2E2E]">Team features:</p>
                            <ul className="space-y-3">
                                {TIER_FEATURES['Team'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-[#FF4F00] flex-shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 4. Enterprise Plan */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="mb-6">
                            <h3 className="font-bold text-2xl mb-2 text-[#2D2E2E]">Enterprise</h3>
                            <p className="text-sm text-slate-500 min-h-[40px] leading-snug">
                                Scale automation across your entire organization.
                            </p>
                        </div>
                        <div className="mb-8 pt-4">
                            <div className="text-3xl font-bold tracking-tight text-[#2D2E2E] mb-1">
                                Contact
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-[#2D2E2E]">
                                for pricing
                            </div>
                        </div>
                        <Button className="w-full mb-8 font-semibold py-6 bg-[#2D2E2E] hover:bg-slate-800 text-white">
                            Contact Sales →
                        </Button>
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-[#2D2E2E]">Enterprise features:</p>
                            <ul className="space-y-3">
                                {TIER_FEATURES['Enterprise'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <Check className="w-4 h-4 text-[#FF4F00] flex-shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Footer Info */}
                <div className="mt-16 text-center">
                    <p className="text-slate-500">
                        Need a custom plan? <button className="text-[#FF4F00] font-semibold hover:underline">Contact Sales</button> for enterprise pricing.
                    </p>
                </div>
            </div>
        </div>
    );
}

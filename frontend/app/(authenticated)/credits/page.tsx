'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CreditsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
            .then(data => setPackages(data.packages))
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

            // Check if order creation failed
            if (!orderRes.ok || !orderData.order_id) {
                alert(`Failed to create order: ${orderData.detail || 'Unknown error'}`);
                setLoading(false);
                return;
            }

            // Open Razorpay checkout
            const options = {
                key: 'rzp_test_S8FZBnr4Ocgdp', // Your Razorpay key
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'FlowSaaS Credits',
                description: `${orderData.credits} Credits`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    // Verify payment
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
                    color: '#2563eb'
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

    if (!user) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
                        ← Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold">Top Up Credits</h1>
                    <p className="text-slate-400 mt-2">Current Balance: <span className="text-blue-400 font-bold">{user.credits}</span> credits</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-blue-600 transition-colors">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400 mb-2">{pkg.credits}</div>
                                <div className="text-slate-400 text-sm mb-4">Credits</div>
                                <div className="text-2xl font-bold mb-6">₹{pkg.price}</div>
                                <Button
                                    className="w-full"
                                    onClick={() => handlePurchase(pkg.id)}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Purchase'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

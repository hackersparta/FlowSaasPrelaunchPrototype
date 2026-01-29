'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Store,
    Zap,
    Settings,
    LogOut,
    Workflow,
    Plus,
    Coins
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState('user@email.com');
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        // Fetch user details from localStorage or token
        const email = localStorage.getItem('user_email');
        if (email) {
            setUserEmail(email);
        }

        // Mock credits for now, or fetch from API
        // In a real app, you'd fetch this from your backend
        setCredits(1250);
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Marketplace', href: '/marketplace', icon: Store },
        { name: 'Automations', href: '/automations', icon: Zap },
        { name: 'Tools', href: '/tools', icon: Workflow },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-50 text-slate-300">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF4F00] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tight">FlowSaaS</h1>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Automation Platform</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                                ${active
                                    ? 'bg-gradient-to-r from-[#FF4F00] to-orange-600 text-white shadow-lg shadow-orange-500/20'
                                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Credits Section */}
            <div className="px-4 pb-2">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                                <Coins className="w-4 h-4 text-yellow-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-300">Credits</span>
                        </div>
                        <Link href="/credits" className="p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
                            <Plus className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-white">{credits.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 mb-1.5">available</span>
                    </div>
                </div>
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer mb-2 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-inner ring-2 ring-slate-800 group-hover:ring-slate-700 transition-all">
                        <span className="text-white font-bold text-sm">
                            {userEmail.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">User Account</p>
                        <p className="text-slate-500 text-xs truncate">{userEmail}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_email');
                        window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
                >
                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

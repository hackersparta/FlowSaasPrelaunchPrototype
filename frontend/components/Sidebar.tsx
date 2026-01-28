'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Store,
    Zap,
    Settings,
    LogOut,
    Workflow
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col shadow-2xl z-50">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF4F00] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl">FlowSaaS</h1>
                        <p className="text-slate-400 text-xs">Automation Platform</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                ${active
                                    ? 'bg-gradient-to-r from-[#FF4F00] to-orange-600 text-white shadow-lg shadow-orange-500/30'
                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">U</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">User</p>
                        <p className="text-slate-400 text-xs truncate">user@email.com</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

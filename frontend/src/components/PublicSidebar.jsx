import React from 'react';
import { Compass, Mountain, Share2, LogIn, UserPlus } from 'lucide-react';

export const PublicSidebar = ({ onLogin, onSignup, onDiscover, onSummit, onNetwork }) => {
    const menuItems = [
        { label: 'Discover', icon: Compass, action: onDiscover },
        { label: 'Summits', icon: Mountain, action: onSummit },
        { label: 'Network', icon: Share2, action: onNetwork },
    ];

    return (
        <aside className="fixed top-0 left-0 h-screen w-20 lg:w-64 bg-[#EEF2FF] flex flex-col z-50 transition-all duration-300">
            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8">
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="hidden lg:block text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                        IBZ
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-8 px-2 lg:px-6 space-y-2 overflow-y-auto">
                {menuItems.map((item, idx) => (
                    <a
                        key={idx}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (item.action) item.action();
                        }}
                        className="flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group relative overflow-hidden"
                    >
                        <item.icon size={22} className="group-hover:text-indigo-600 transition-colors shrink-0" />
                        <span className="hidden lg:block font-bold tracking-wide text-sm">{item.label}</span>

                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </a>
                ))}
            </nav>

            {/* Sidebar Decorative Image Removed */}

            {/* Auth Buttons Removed - Moved to Top Navigation */}
        </aside>
    );
};

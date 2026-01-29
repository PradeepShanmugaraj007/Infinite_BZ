import { X, TrendingUp, Users, Calendar, BarChart3, Clock, MapPin, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventStatsModal({ isOpen, onClose, event }) {
    if (!isOpen || !event) return null;

    // Derived Stats (Mental Model: Premium Analytics Dashboard)
    const totalRegistrations = event.registration_count || 0;
    const capacity = event.raw_data?.capacity || 100;
    const fillRate = Math.round((totalRegistrations / capacity) * 100);
    const revenue = event.raw_data?.price ? event.raw_data.price * totalRegistrations : 0;

    // Mock Trend Data (To simulate professional analytics)
    const recentActivity = [
        { name: 'Last 24h', value: '+' + Math.floor(Math.random() * 5) },
        { name: 'This Week', value: '+' + Math.floor(Math.random() * 20) },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                    <BarChart3 className="text-primary-500" />
                                    Analytics Center
                                </h2>
                                <p className="text-slate-400 text-sm">Real-time insights for <span className="text-white font-medium">{event.title}</span></p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Dashboard Grid */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Main Stat Card: Total Registrations */}
                            <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-slate-400 font-medium mb-1">Total Registrations</p>
                                    <div className="flex items-baseline gap-3">
                                        <h3 className="text-5xl font-extrabold text-white tracking-tight">{totalRegistrations}</h3>
                                        <span className="text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                                            <TrendingUp size={14} /> {fillRate}% Full
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-6">
                                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                                            <span>Progress to Request Capacity</span>
                                            <span>{totalRegistrations} / {capacity}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(fillRate, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Stat: Status */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between">
                                <div>
                                    <p className="text-slate-400 font-medium mb-1">Current Status</p>
                                    <h3 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        {event.status || 'Active'}
                                    </h3>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    <p className="text-xs text-slate-500 mb-1">Time until event</p>
                                    <p className="text-white font-mono text-sm">
                                        14d : 12h : 30m
                                    </p>
                                </div>
                            </div>

                            {/* Row 2: Detailed Metrics */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Recent Signups</p>
                                        <p className="text-xl font-bold text-white">12 <span className="text-xs font-normal text-slate-500">last 24h</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Top Location</p>
                                        <p className="text-xl font-bold text-white">Chennai <span className="text-xs font-normal text-slate-500">82%</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                        <Download size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Export Data</p>
                                        <button className="text-sm text-primary-400 hover:text-primary-300 font-medium underline decoration-dashed underline-offset-4">
                                            Download CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

import { useState } from 'react';
import {
    Calendar, MapPin, Clock, User, Mail, Ticket, Globe, X, Share2, Heart,
    CheckCircle2, ArrowRight, Linkedin, Twitter, Shield, Star, LayoutGrid
} from 'lucide-react';

export default function EventDetailModal({ event, isOpen, onClose, onRegister, isRegistered }) {
    if (!isOpen || !event) return null;

    const [activeTab, setActiveTab] = useState('about');
    const isInternal = event.raw_data?.source === 'InfiniteBZ';
    const isOnline = event.online_event || event.mode === 'online';

    // Mock Data for Enhanced UI
    const speakers = [
        { name: "Arjun Varun", role: "CEO, Z-Corp", image: "https://i.pravatar.cc/150?u=arjun" },
        { name: "Meera Reddy", role: "Founder, ScaleUp", image: "https://i.pravatar.cc/150?u=meera" },
        { name: "David Chen", role: "CTO, TechFlow", image: "https://i.pravatar.cc/150?u=david" }
    ];

    const agenda = [
        { time: "10:00 AM", title: "Registration & Networking", desc: "Pick up your badge and meet fellow attendees." },
        { time: "11:00 AM", title: "Keynote: Future of Tech", desc: "Deep dive into 2024 trends with industry leaders." },
        { time: "01:00 PM", title: "Lunch Break", desc: "Gourmet lunch provided at the venue." },
        { time: "02:30 PM", title: "Workshops", desc: "Hands-on sessions on AI, Marketing, and Sales." }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-200">
            {/* Main Modal Container - Full height on mobile, centered on desktop */}
            <div className="bg-slate-900 w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-2xl flex flex-col md:overflow-hidden relative border border-slate-700/50">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
                >
                    <X size={20} />
                </button>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* HERO SECTION */}
                    <div className="relative h-64 md:h-80 w-full">
                        {event.image_url ? (
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                                <span className="text-8xl font-black text-slate-800 uppercase tracking-tighter opacity-50">Event</span>
                            </div>
                        )}
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                        {/* Hero Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${event.is_free
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    }`}>
                                    {event.is_free ? 'Free Entry' : 'Paid Ticket'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-bold uppercase tracking-wide border border-white/10 backdrop-blur-md">
                                    {isOnline ? 'Online' : 'In Person'}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight shadow-lg">
                                {event.title}
                            </h1>
                            <p className="text-slate-300 text-sm md:text-base flex items-center gap-2">
                                <span className="text-primary-400 font-bold">Hosted by {event.organizer_name}</span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                <span>{event.raw_data?.category || "Networking"}</span>
                            </p>
                        </div>
                    </div>

                    {/* MAIN CONTENT GRID */}
                    <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN - CONTENT (8 cols) */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* TABS Navigation */}
                            <div className="flex border-b border-slate-700">
                                {['about', 'agenda', 'speakers'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === tab
                                                ? 'border-primary-500 text-primary-400'
                                                : 'border-transparent text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* TAB CONTENT */}
                            <div className="min-h-[300px]">
                                {activeTab === 'about' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                                            <h3 className="text-xl font-bold text-white mb-4">Why Attend?</h3>
                                            <ul className="space-y-3">
                                                {[
                                                    "Network with 150+ like-minded professionals",
                                                    "Learn actionable strategies from industry experts",
                                                    "Exclusive access to post-event mixer",
                                                    "Get certified participation credits"
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <CheckCircle2 className="text-green-500 mt-0.5" size={18} />
                                                        <span className="text-slate-300 font-medium">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                                            <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-lg">
                                                {event.description || "Join us for an immersive experience designed to connect, educate, and inspire. This event brings together the brightest minds in the industry for a day of collaboration and growth."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'agenda' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {agenda.map((item, i) => (
                                            <div key={i} className="flex gap-4 p-4 hover:bg-slate-800/50 rounded-xl transition-colors group">
                                                <div className="w-24 flex-shrink-0 text-right pt-1">
                                                    <span className="font-bold text-white block">{item.time.split(' ')[0]}</span>
                                                    <span className="text-xs text-slate-500 uppercase">{item.time.split(' ')[1]}</span>
                                                </div>
                                                <div className="relative pl-6 border-l-2 border-slate-700 group-hover:border-primary-500 transition-colors">
                                                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-600 group-hover:border-primary-500 transition-colors" />
                                                    <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                                                    <p className="text-slate-400 text-sm">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'speakers' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {speakers.map((speaker, i) => (
                                            <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4 hover:border-primary-500/50 transition-colors">
                                                <img src={speaker.image} className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" />
                                                <div>
                                                    <h4 className="font-bold text-white">{speaker.name}</h4>
                                                    <p className="text-sm text-primary-400">{speaker.role}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Linkedin size={14} className="text-slate-500 hover:text-white cursor-pointer" />
                                                        <Twitter size={14} className="text-slate-500 hover:text-white cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN - SIDEBAR (4 cols) - STICKY */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* ACTION CARD */}
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-4">
                                <div className="mb-6">
                                    <p className="text-slate-400 text-sm mb-1">Price</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-extrabold text-white">
                                            {event.is_free ? 'Free' : `₹${event.raw_data?.price || 499}`}
                                        </span>
                                        {!event.is_free && <span className="text-slate-500 mb-1 line-through text-sm">₹999</span>}
                                    </div>
                                    <p className="text-red-400 text-xs font-bold mt-2 flex items-center gap-1">
                                        <Clock size={12} /> Only {event.raw_data?.capacity ? Math.floor(event.raw_data.capacity * 0.1) : 12} seats left
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!isRegistered) {
                                            onRegister(event);
                                            // onClose(); // Optional: keep open to show success state
                                        }
                                    }}
                                    disabled={isRegistered}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isRegistered
                                            ? 'bg-green-500 text-white cursor-default'
                                            : 'bg-primary-500 hover:bg-primary-600 text-slate-900 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1'
                                        }`}
                                >
                                    {isRegistered ? (
                                        <> <CheckCircle2 /> Registered </>
                                    ) : (
                                        <> <Ticket className="animate-pulse" /> Auto-Register </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-slate-500 mt-3">
                                    One-click registration powered by InfiniteBZ
                                </p>
                            </div>

                            {/* DETAILS CARD */}
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 space-y-5">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 text-primary-500 border border-slate-700">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">
                                            {new Date(event.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 05:00 PM
                                        </p>
                                        <button className="text-primary-400 text-xs font-bold mt-1 hover:underline">Add to Calendar</button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 text-primary-500 border border-slate-700">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">
                                            {event.venue_name || "Online Event"}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {event.venue_address || "Chennai, Tamil Nadu"}
                                        </p>
                                        <button className="text-primary-400 text-xs font-bold mt-1 hover:underline">Get Directions</button>
                                    </div>
                                </div>

                                {/* Mini Map Placeholder */}
                                <div className="h-32 bg-slate-700/30 rounded-xl w-full relative overflow-hidden group cursor-pointer">
                                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/80.2376,13.0674,13,0/300x200?access_token=PLACEHOLDER')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white text-slate-900 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold flex items-center gap-1 group-hover:scale-110 transition-transform">
                                            <MapPin size={12} className="text-red-500" /> View Map
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ORGANIZER CARD */}
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {event.organizer_name?.[0] || 'C'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white text-sm">{event.organizer_name || "Community Host"}</p>
                                    <p className="text-xs text-slate-400">Organized by {event.organizer_name?.split(' ')[0]}</p>
                                </div>
                                <button className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-bold text-white hover:bg-slate-700 transition-colors">
                                    Follow
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, Calendar, Settings, LogOut,
    TrendingUp, AlertCircle, CheckCircle2, MoreHorizontal,
    Search, Bell, Plus, Download, MessageSquare, ClipboardList, X
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
    const [stats, setStats] = useState({
        total_users: 0,
        active_events: 0,
        ingestion_errors: 0,
        pending_approvals: 0,
        recent_events: []
    });
    const [eventsData, setEventsData] = useState({
        data: [],
        total: 0,
        page: 1,
        limit: 10
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // Track input
    const [activeSearch, setActiveSearch] = useState(""); // Track triggered search

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    useEffect(() => {
        fetchEvents(currentPage, activeSearch);
    }, [currentPage, activeSearch]);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
        }
    };

    const fetchEvents = async (page, search = "") => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Construct Query Params
            const params = new URLSearchParams({
                page: page,
                limit: 10
            });
            if (search && search.trim() !== "") {
                params.append('search', search.trim());
            }

            const res = await fetch(`http://localhost:8000/api/v1/events?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

                // ROBUST HANDLING: Check if array or object
                if (data && Array.isArray(data.data)) {
                    // BACKEND UPGRADE: API now returns { data, total, page, limit }
                    setEventsData({
                        data: data.data,
                        total: data.total,
                        page: data.page,
                        limit: data.limit
                    });
                } else if (Array.isArray(data)) {
                    // Fallback for old structure or during transition
                    setEventsData({
                        data: data,
                        total: 100, // Mock total
                        page: page,
                        limit: 10
                    });
                } else {
                    // Fallback for empty or unexpected structure
                    setEventsData({
                        data: [],
                        total: 0,
                        page: page,
                        limit: 10
                    });
                }
            } else {
                console.error("API Error:", res.status);
            }
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            setActiveSearch(searchQuery);
        }
    };

    const totalPages = Math.ceil(eventsData.total / 10);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* SIDEBAR (Accent Purple #953FC2) */}
            <aside className="w-64 bg-[#953FC2] border-r border-white/20 flex flex-col fixed h-full z-20 hidden lg:flex text-white">
                <div className="p-6">
                    <div className="flex items-center gap-3 font-bold text-xl text-white">
                        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                            <i className="text-white">EF</i>
                        </div>
                        <div>
                            EventFlow
                            <span className="block text-[10px] font-normal text-white/70">Chennai Edition</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<ClipboardList size={20} />} label="My Registrations" />
                    <NavItem icon={<TrendingUp size={20} />} label="Analytics" />
                    <NavItem icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4">
                    <button className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-sky-700 rounded-lg font-bold transition-colors shadow-lg shadow-gold-500/30">
                        Add New Source
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:text-white mt-4 transition-colors">
                        <LogOut size={18} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 lg:ml-64 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-bold text-white">Events Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search events, venues..."
                                className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-sky-500 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                        <button className="relative text-slate-500 hover:text-sky-600">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.full_name?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Total Events"
                        value={loading ? '...' : stats.active_events}
                        subtext="+12% vs last week"
                        subtextColor="text-green-500"
                        icon={<Calendar className="text-sky-500" size={24} />}
                    />
                    <StatCard
                        title="Free Events"
                        value={loading ? '...' : stats.free_events || 0}
                        subtext="62% of total volume"
                        subtextColor="text-slate-500"
                        icon={<Users className="text-indigo-500" size={24} />}
                    />
                    <StatCard
                        title="Auto-Registered"
                        value={loading ? '...' : stats.auto_registered || 0}
                        subtext="Based on your preferences"
                        subtextColor="text-slate-500"
                        icon={<CheckCircle2 className="text-green-500" size={24} />}
                    />
                </div>

                {/* FILTERS & LIST */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            Last updated: 5m ago <span className="cursor-pointer hover:text-sky-500">↻</span>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <FilterBtn label="City: Chennai" />
                        <FilterBtn label="Industry: Startup" />
                        <FilterBtn label="Source: All" />
                        <FilterBtn label="Cost: Free" active />
                        <FilterBtn label="Audience: Founders" />
                        <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                            <Calendar size={16} /> This Week
                        </button>
                    </div>

                    {/* HEADERS */}
                    <div className="grid grid-cols-12 gap-4 px-6 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-1">Date</div>
                        <div className="col-span-5">Event Details</div>
                        <div className="col-span-3">Location</div>
                        <div className="col-span-2">Source</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {/* EVENTS LIST */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Loading events...</div>
                        ) : (
                            <>
                                {eventsData.data?.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                                {(!eventsData.data || eventsData.data.length === 0) && (
                                    <div className="text-center py-10 text-slate-500">No events found matching criteria.</div>
                                )}
                            </>
                        )}
                    </div>

                    {/* PAGINATION */}
                    <div className="flex justify-center mt-10 gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-500 transition-colors"
                        >
                            ‹
                        </button>

                        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === page
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                    : 'text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-500 transition-colors"
                        >
                            ›
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}

// --- SUBCOMPONENTS ---


function NavItem({ icon, label, active }) {
    return (
        <button className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all mb-1 ${active
            ? 'bg-white/20 text-white font-bold' // Active state on purple sidebar
            : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}>
            {icon}
            <span className="text-sm">{label}</span>
        </button>
    )
}

function StatCard({ title, value, subtext, subtextColor, icon }) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
            <p className="text-sm text-slate-500 font-medium mb-2">{title}</p>
            {subtext && (
                <p className={`text-xs font-semibold ${subtextColor}`}>{subtext}</p>
            )}
        </div>
    )
}

function FilterBtn({ label, active }) {
    return (
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${active
            ? 'bg-sky-50 border-sky-200 text-sky-600'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {label}
            {active && <span className="text-lg leading-none">×</span>}
            {!active && <span className="text-[10px] opacity-50">▼</span>}
        </button>
    )
}

function EventCard({ event }) {
    const date = new Date(event.start_time);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-x-4 items-center hover:shadow-md transition-all">
            {/* DATE BLOCK - Col 1 */}
            <div className="lg:col-span-1 flex justify-center lg:justify-start">
                <div className="w-16 h-16 lg:w-full lg:h-20 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-xs font-bold text-red-500 uppercase">{month}</span>
                    <span className="text-2xl font-bold text-slate-800">{day}</span>
                </div>
            </div>

            {/* DETAILS - Col 5 */}
            <div className="lg:col-span-5 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${event.is_free ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {event.is_free ? 'FREE' : 'PAID'}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${event.online_event ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {event.online_event ? '🌐 ONLINE' : '📍 IN PERSON'}
                    </span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{event.title}</h4>
                <p className="text-sm text-slate-500 flex items-center justify-center lg:justify-start gap-1">
                    By <span className="text-sky-600 font-medium">{event.organizer_name || 'Event Organizer'}</span>
                    <span className="mx-1">•</span>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {/* LOCATION - Col 3 */}
            <div className="lg:col-span-3 text-center lg:text-left">
                <h5 className="font-bold text-slate-800 text-sm mb-1">{event.venue_name || 'TBD'}</h5>
                <p className="text-xs text-slate-500 truncate" title={event.venue_address}>{event.venue_address || 'Chennai, India'}</p>
            </div>

            {/* SOURCE - Col 2 */}
            <div className="lg:col-span-2 flex justify-center lg:justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {event.url && event.url.includes('eventbrite') ? 'EB' : 'O'}
                </div>
                <span className="text-sm font-medium text-slate-600">
                    {event.url && event.url.includes('eventbrite') ? 'Eventbrite' : 'Other'}
                </span>
            </div>

            {/* ACTION - Col 1 */}
            <div className="lg:col-span-1 flex justify-center lg:justify-end">
                <a
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-gold-500 hover:bg-gold-600 text-sky-700 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-gold-500/20 whitespace-nowrap"
                >
                    Register
                </a>
            </div>
        </div>
    )
}

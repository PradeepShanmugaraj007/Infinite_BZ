import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, Calendar, Settings, LogOut,
    TrendingUp, AlertCircle, CheckCircle2, MoreHorizontal,
    Search, Bell, Plus, Download, MessageSquare, ClipboardList, X, Eye
} from 'lucide-react';
import CityDropdown from './CityDropdown';
import CreateEventModal from './CreateEventModal';
import EventDetailModal from './EventDetailModal';
import MyEvents from './MyEvents';
import MyRegistrationsPage from './MyRegistrationsPage';
import Sidebar from './Sidebar';

export default function Dashboard({ user, onLogout, onNavigate }) {
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
    const [selectedCity, setSelectedCity] = useState("All Cities");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedSource, setSelectedSource] = useState("All");
    const [selectedCost, setSelectedCost] = useState("All");
    const [selectedMode, setSelectedMode] = useState("All");
    const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        fetchDashboardStats();
        fetchUserRegistrations(); // Fetch existing registrations to show registered status
    }, []);

    useEffect(() => {
        fetchEvents(currentPage, activeSearch, selectedCity, selectedCategory, selectedSource, selectedCost, selectedMode, selectedDate);
    }, [currentPage, activeSearch, selectedCity, selectedCategory, selectedSource, selectedCost, selectedMode, selectedDate]);

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

    const fetchUserRegistrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/user/registrations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserRegistrations(data.registrations || []);
                // Also update newlyRegisteredIds to include existing registrations
                const registeredIds = (data.registrations || []).map(reg => reg.id);
                setNewlyRegisteredIds(prev => [...new Set([...prev, ...registeredIds])]);
            }
        } catch (err) {
            console.error("Failed to fetch user registrations", err);
        }
    };

    const fetchEvents = async (page, search = "", city = "Chennai", category = "All", source = "All", cost = "All", mode = "All", date = "") => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Construct Query Params
            const params = new URLSearchParams({
                page: page,
                limit: 10,
                city: city === "All Cities" ? "all" : city,
                category: category === "All" ? "all" : category,
                source: source === "All" ? "all" : source,
                is_free: cost === "All" ? "" : cost.toLowerCase(),
                mode: mode === "All" ? "" : (mode === "In Person" ? "offline" : mode.toLowerCase()),
                date: date
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

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInternalEvent, setSelectedInternalEvent] = useState(null);
    const [activeView, setActiveView] = useState('feed'); // 'feed' or 'my-events'

    const [pendingEventId, setPendingEventId] = useState(null);
    const [pendingEventTitle, setPendingEventTitle] = useState("");
    const [newlyRegisteredIds, setNewlyRegisteredIds] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);

    const handleRegisterClick = (event) => {
        // CHECK SOURCE: If InfiniteBZ, open Detail Modal
        if (event.raw_data?.source === 'InfiniteBZ') {
            setSelectedInternalEvent(event);
            setShowDetailModal(true);
            return;
        }

        // 1. Open URL in New Tab
        window.open(event.url, '_blank');

        // 2. Show Confirmation Modal
        setPendingEventId(event.id);
        setPendingEventTitle(event.title);
        setShowConfirmModal(true);
    };

    const handleInternalRegistration = async (event) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/v1/events/${event.id}/register`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let data;
            try {
                data = await res.json();
            } catch (parseErr) {
                console.error('Failed to parse response:', parseErr);
                alert(`Registration failed: Server error (${res.status})`);
                return;
            }

            if (res.ok && data.status === 'SUCCESS') {
                // Registration successful - update UI state
                setNewlyRegisteredIds(prev => [...prev, event.id]);
                alert('Registration successful!');
            } else if (data.status === 'ALREADY_REGISTERED') {
                // Already registered - still update UI
                setNewlyRegisteredIds(prev => [...prev, event.id]);
                alert('You are already registered for this event.');
            } else {
                // Registration failed - show detailed error
                const errorMessage = data.detail || data.message || `Server error (${res.status})`;
                alert(`Registration failed: ${errorMessage}`);
                console.error('Registration failed:', data);
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Registration failed. Please try again.');
        }
    };

    const handleCreateEvent = async (eventData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/events', { // Standard create endpoint
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
            const data = await res.json();

            if (res.ok) {
                alert("Event Created Successfully!");
                setShowCreateEventModal(false);
                // Refresh list
                fetchEvents(1, activeSearch, selectedCity, selectedCategory, selectedSource, selectedCost, selectedMode, selectedDate);
            } else {
                alert(`Creation Failed: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Create event error", err);
            alert("Failed to create event");
        }
    };

    const confirmRegistration = async () => {
        if (!pendingEventId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/v1/events/${pendingEventId}/register`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok && data.status === 'SUCCESS') {
                // Registration successful - update UI state
                setNewlyRegisteredIds(prev => [...prev, pendingEventId]);
                alert('Registration confirmed successfully!');
                // Close modal
                setShowConfirmModal(false);
                setPendingEventId(null);
                setPendingEventTitle("");
            } else if (data.status === 'ALREADY_REGISTERED') {
                // Already registered - still update UI
                setNewlyRegisteredIds(prev => [...prev, pendingEventId]);
                alert('You are already registered for this event.');
                // Close modal
                setShowConfirmModal(false);
                setPendingEventId(null);
                setPendingEventTitle("");
            } else {
                // Registration failed - don't update UI
                alert(`Registration failed: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Confirmation error", err);
            alert('Registration confirmation failed. Please try again.');
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            setActiveSearch(searchQuery);
        }
    };

    const totalPages = Math.ceil(eventsData.total / eventsData.limit);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* SIDEBAR (Dark Slate) */}
            {/* SIDEBAR */}
            <Sidebar
                activePage={activeView === 'feed' ? 'dashboard' : activeView}
                onNavigate={(view) => {
                    if (view === 'dashboard') setActiveView('feed');
                    else if (view === 'my-events') setActiveView('my-events');
                    else if (view === 'my-registrations') setActiveView('my-registrations');
                    else if (view === 'settings') onNavigate('settings');
                }}
                onLogout={onLogout}
                onCreateClick={() => onNavigate('create-event')}
            />

            {/* MAIN CONTENT */}
            <main className="flex-1 lg:ml-64 p-8">
                {activeView === 'my-events' ? (
                    <MyEvents onCreateNew={() => onNavigate('create-event')} />
                ) : activeView === 'my-registrations' ? (
                    <MyRegistrationsPage onNavigate={() => setActiveView('feed')} user={user} />
                ) : (
                    <>
                        {/* Header */}
                        <header className="flex justify-between items-center mb-10">
                            <h1 className="text-2xl font-bold text-white">Events Dashboard</h1>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search events, venues..."
                                        className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 w-64 placeholder:text-slate-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearch}
                                    />
                                </div>
                                <button className="relative text-slate-500 hover:text-sky-600">
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-white/20 transition-all overflow-hidden"
                                    >
                                        {user?.profile_image ? (
                                            <img
                                                src={user.profile_image}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary-500 rounded-full flex items-center justify-center text-slate-900 font-bold">
                                                {user?.full_name?.[0] || 'A'}
                                            </div>
                                        )}
                                    </button>

                                    {showProfileMenu && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="px-4 py-3 border-b border-slate-700 mb-1">
                                                    <p className="text-sm font-bold text-white">{user?.full_name || 'Admin User'}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                                                </div>

                                                <button
                                                    onClick={() => onNavigate('settings')}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
                                                >
                                                    <Settings size={16} /> Settings
                                                </button>

                                                <div className="h-px bg-slate-100 my-1" />

                                                <button
                                                    onClick={onLogout}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
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
                                <CityDropdown selected={selectedCity} onChange={setSelectedCity} />
                                <FilterDropdown
                                    label="Industry"
                                    options={["All", "Startup", "Business", "Sports", "Tech", "Music"]}
                                    selected={selectedCategory}
                                    onChange={setSelectedCategory}
                                />
                                <FilterDropdown
                                    label="Source"
                                    options={["All", "Eventbrite", "Meetup", "InfiniteBZ"]}
                                    selected={selectedSource}
                                    onChange={setSelectedSource}
                                />
                                <FilterDropdown
                                    label="Cost"
                                    options={["All", "Free", "Paid"]}
                                    selected={selectedCost}
                                    onChange={setSelectedCost}
                                />
                                <FilterDropdown
                                    label="Mode"
                                    options={["All", "Online", "In Person"]}
                                    selected={selectedMode}
                                    onChange={setSelectedMode}
                                />
                                <div className="ml-auto relative">
                                    <input
                                        type="date"
                                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:border-sky-500 hover:bg-slate-50 cursor-pointer"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* HEADERS */}
                            <div className="grid grid-cols-12 gap-4 px-6 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <div className="col-span-1">Date</div>
                                <div className="col-span-5">Event Details</div>
                                <div className="col-span-2">Location</div>
                                <div className="col-span-2">Source</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>

                            {/* EVENTS LIST */}
                            {/* EVENTS LIST */}
                            <div className="space-y-4">
                                {loading && <div className="text-center py-10 text-slate-500">Loading events...</div>}

                                {!loading && eventsData.data && eventsData.data.length > 0 && (
                                    eventsData.data.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            isRegistered={newlyRegisteredIds.includes(event.id)}
                                            onRegister={() => handleRegisterClick(event)}
                                        />
                                    ))
                                )}

                                {!loading && (!eventsData.data || eventsData.data.length === 0) && (
                                    <div className="text-center py-10 text-slate-500">No events found matching criteria.</div>
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
                                            ? 'bg-primary-500 text-slate-900 shadow-lg shadow-primary-500/30'
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

                        {/* CONFIRMATION MODAL */}
                        {showConfirmModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                                    <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="text-primary-500" size={32} />
                                    </div>

                                    <h3 className="text-xl font-bold text-white text-center mb-2">
                                        Did you register?
                                    </h3>
                                    <p className="text-slate-400 text-center text-sm mb-8">
                                        We opened <strong>{pendingEventTitle}</strong> in a new tab.
                                        <br />If you completed the registration there, click "Yes" to track it here.
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowConfirmModal(false);
                                                setPendingEventId(null);
                                                setPendingEventTitle("");
                                            }}
                                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                                        >
                                            No, not yet
                                        </button>
                                        <button
                                            onClick={confirmRegistration}
                                            className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-slate-900 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all"
                                        >
                                            Yes, I registered
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </>
                )}

                <CreateEventModal
                    isOpen={showCreateEventModal}
                    onClose={() => setShowCreateEventModal(false)}
                    onSave={handleCreateEvent}
                />

                <EventDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    event={selectedInternalEvent}
                    onRegister={handleInternalRegistration}
                    isRegistered={selectedInternalEvent && newlyRegisteredIds.includes(selectedInternalEvent.id)}
                />

                {/* Refresh registrations when navigating to My Registrations */}
                {activeView === 'my-registrations' && (
                    <div style={{ display: 'none' }}>
                        {/* Hidden trigger to refresh registrations when viewing My Registrations */}
                        {(() => {
                            // This will trigger when activeView changes to 'my-registrations'
                            if (activeView === 'my-registrations') {
                                // We could fetch registrations here if needed, but MyRegistrationsPage handles it
                            }
                            return null;
                        })()}
                    </div>
                )}
            </main>
        </div >
    );
}

// --- SUBCOMPONENTS ---


// function NavItem removed as it is now in Sidebar.jsx

function StatCard({ title, value, subtext, subtextColor, icon }) {
    return (
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex items-start justify-between hover:border-primary-500/30 transition-colors">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
                <p className={`text-xs ${subtextColor}`}>{subtext}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${icon.props.className?.includes('text-gold') ? 'bg-primary-500/10 text-primary-500' : 'bg-slate-700 text-slate-400'}`}>
                {icon}
            </div>
        </div>
    );
}

function FilterDropdown({ label, options, selected, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selected !== 'All'
                    ? 'bg-primary-50 border-primary-200 text-primary-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
            >
                {label}: {selected}
                <span className="text-[10px] opacity-50">▼</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-2 left-0 w-40 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-20">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${selected === option ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

function EventCard({ event, onRegister, isRegistered }) {
    const [registering, setRegistering] = useState(false);

    const handleClick = async () => {
        if (event.raw_data?.source === 'InfiniteBZ') {
            onRegister(); // Parent handles opening modal
        } else if (event.is_free && event.url.includes("eventbrite")) {
            setRegistering(true);
            await onRegister();
            setRegistering(false);
        } else {
            window.open(event.url, '_blank');
        }
    };

    return (
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl items-center hover:shadow-md transition-shadow hover:shadow-gold-500/10">
            {/* Date Block - col-span-1 */}
            <div className="col-span-1 flex justify-center">
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-red-500 uppercase">
                        {new Date(event.start_time).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-white">
                        {new Date(event.start_time).getDate()}
                    </span>
                </div>
            </div>

            {/* Content - col-span-5 */}
            <div className="col-span-5 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${event.is_free ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {event.is_free ? 'Free' : 'Paid'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        {event.online_event ? 'Online' : 'In Person'}
                    </span>
                </div>
                <h3 className="text-base font-bold text-white truncate mb-1" title={event.title}>
                    {event.title}
                </h3>
                <p className="text-xs text-slate-500 truncate mb-2">
                    <span className="text-sky-400 font-medium">By {event.organizer_name || "Unknown"}</span> • {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {/* Location - col-span-2 */}
            <div className="col-span-2 text-xs text-slate-500 hidden md:block">
                <p className="font-semibold text-slate-300 truncate mb-0.5">
                    {event.venue_name || (event.online_event ? "Online Event" : "TBD")}
                </p>
                <p className="truncate text-slate-400">
                    {event.venue_address || (event.online_event ? "Link sent upon registration" : "Chennai, India")}
                </p>
            </div>

            {/* Source - col-span-2 */}
            <div className="col-span-2 hidden lg:flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${event.raw_data?.source === 'InfiniteBZ' ? 'bg-primary-500 text-slate-900' : 'bg-slate-700 text-orange-500'
                    }`}>
                    {event.raw_data?.source === 'InfiniteBZ' ? 'IB' : 'EB'}
                </div>
                <span className={`text-xs font-medium ${event.raw_data?.source === 'InfiniteBZ' ? 'text-primary-400' : 'text-orange-400'
                    }`}>
                    {event.raw_data?.source === 'InfiniteBZ' ? 'InfiniteBZ' : 'Eventbrite'}
                </span>
            </div>

            {/* Action - col-span-2 */}
            <div className="col-span-2 text-right">
                <button
                    onClick={handleClick}
                    disabled={registering || isRegistered}
                    className={`w-32 py-2.5 rounded-lg uppercase tracking-wider font-bold transition-all inline-flex items-center justify-center gap-2 ${isRegistered
                        ? 'bg-green-500 text-white cursor-default text-[10px]'
                        : registering
                            ? 'bg-slate-700 text-slate-400 cursor-wait text-xs'
                            : 'bg-primary-500 hover:bg-primary-400 text-slate-900 shadow-lg shadow-primary-500/20 text-xs'
                        }`}
                >
                    {event.raw_data?.source === 'InfiniteBZ'
                        ? (
                            isRegistered ? (
                                <> <span>Registered</span> <CheckCircle2 size={14} /> </>
                            ) : (
                                <> <span>Register</span> <Eye size={14} /> </>
                            )
                        )
                        : (registering ? 'Processing...' : isRegistered ? 'Registered' : 'Register')
                    }
                </button>
            </div>
        </div>
    );
}

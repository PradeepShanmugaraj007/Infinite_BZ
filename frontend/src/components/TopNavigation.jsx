import React, { useState, useEffect } from 'react';
import { Search, LogIn, UserPlus, Bell, Calendar, MapPin, Clock } from 'lucide-react';

export const TopNavigation = ({ onLogin, onSignup, user, events = [], onSearch }) => {
    const [hasNotifications, setHasNotifications] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const checkNotifications = () => {
            if (!events.length) return;

            const lastViewed = localStorage.getItem('notificationLastViewed');
            // Find the most recent event creation time
            // Assuming events have 'created_at' or we use 'start_time' as a proxy if created_at is missing
            // But checking schema, 'created_at' exists.
            const latestEvent = events.reduce((latest, current) => {
                return new Date(current.created_at || current.start_time) > new Date(latest.created_at || latest.start_time) ? current : latest;
            }, events[0]);

            if (!latestEvent) return;

            const latestEventTime = new Date(latestEvent.created_at || latestEvent.start_time).getTime();
            const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;

            if (latestEventTime > lastViewedTime) {
                setHasNotifications(true);
            }
        };

        checkNotifications();
    }, [events]);

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setHasNotifications(false);
            localStorage.setItem('notificationLastViewed', new Date().toISOString());
        }
    };

    // Sort events by creation date for notification feed
    const recentEvents = [...events].sort((a, b) =>
        new Date(b.created_at || b.start_time) - new Date(a.created_at || a.start_time)
    ).slice(0, 5);

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (onSearch) {
                onSearch(searchQuery);
            }
        }
    };

    return (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 py-4 mb-0 border-b border-fuchsia-100/50">
            {/* Search Bar - Reduced size and centered */}
            <div className="flex-1 flex justify-center max-w-2xl">
                <div className="w-full relative group flex items-center bg-white border border-slate-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-all">
                    {/* Search Input */}
                    <div className="flex-1 flex items-center px-4">
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (onSearch) onSearch(e.target.value);
                            }}
                            onKeyDown={handleSearchSubmit}
                        />
                    </div>



                    {/* Location Display */}
                    <div className="hidden sm:flex items-center px-4 w-48 text-slate-600 font-bold text-sm whitespace-nowrap cursor-pointer hover:text-fuchsia-600 transition-colors border-l border-slate-200 h-full">
                        Chennai, IN
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearchSubmit}
                        className="bg-fuchsia-600 text-white p-3 rounded-full hover:bg-fuchsia-700 transition-colors shadow-lg shadow-fuchsia-600/20"
                    >
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 ml-8 relative">
                <button
                    onClick={handleNotificationClick}
                    className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                >
                    <Bell size={22} />
                    {hasNotifications && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                        <div className="absolute right-0 top-full mt-4 w-80 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ring-1 ring-black/5">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
                                <h3 className="text-sm font-bold text-slate-900">New Events</h3>
                                <span className="text-[10px] font-bold text-fuchsia-500 bg-fuchsia-50 px-2 py-0.5 rounded-full">Recent</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {recentEvents.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">No new events</div>
                                ) : (
                                    recentEvents.map((event, idx) => (
                                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                                                    {event.image_url ? (
                                                        <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Calendar size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-fuchsia-600 transition-colors">{event.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(event.start_time).toLocaleDateString()}</span>
                                                        {event.venue_name && <span className="flex items-center gap-1"><MapPin size={10} /> {event.venue_name}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
                {user ? (
                    <div
                        onClick={onLogin}
                        className="flex flex-col items-center cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 max-w-[100px] truncate group-hover:text-slate-900 transition-colors">
                            {user.email}
                        </span>
                    </div>
                ) : (
                    <button
                        onClick={onLogin}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-xl font-bold text-sm hover:from-fuchsia-500 hover:to-pink-500 transition-all shadow-lg shadow-fuchsia-500/20"
                    >
                        <LogIn size={18} />
                        <span>Log In</span>
                    </button>
                )}
            </div>
        </div>
    );
};

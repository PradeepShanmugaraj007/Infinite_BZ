import { useState, useEffect } from 'react';
import { Calendar, MapPin, BarChart3, Users, Clock, Edit, Trash2, Eye, Plus } from 'lucide-react';

export default function MyEvents({ onCreateNew }) {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ active: 0, pending: 0, total_registrations: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/events/my-events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setEvents(data.events || []);
                setStats(data.stats || { active: 0, pending: 0, total_registrations: 0 });
            }
        } catch (err) {
            console.error("Failed to fetch my events", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading your dashboard...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">My Events</h1>
                    <p className="text-slate-400 text-sm">Manage and track all your networking events.</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-slate-900 px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-primary-500/20"
                >
                    <Plus size={18} /> Create New Event
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Events</span>
                        <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-bold text-white">{stats.active}</h2>
                        <span className="text-green-400 text-sm font-medium">+100%</span>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Approval</span>
                        <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-bold text-white">{stats.pending}</h2>
                        <span className="text-slate-500 text-sm font-medium">--</span>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Registrations</span>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-bold text-white">{stats.total_registrations}</h2>
                        <span className="text-green-400 text-sm font-medium">+ New</span>
                    </div>
                </div>
            </div>

            {/* Events Filter/Search Bar (Visual Only for now) */}
            <div className="flex gap-4 bg-slate-800 p-2 rounded-xl border border-slate-700">
                <input
                    placeholder="Search events by name..."
                    className="bg-transparent text-white px-4 py-2 w-full focus:outline-none placeholder:text-slate-600"
                />
                <select className="bg-slate-900 text-slate-300 px-4 rounded-lg border-none focus:ring-0">
                    <option>Newest First</option>
                    <option>Oldest First</option>
                </select>
            </div>

            {/* Events Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase text-slate-400">
                            <th className="p-4 font-semibold">Event Details</th>
                            <th className="p-4 font-semibold">Location</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Registrations</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">
                                    You haven't created any events yet.
                                </td>
                            </tr>
                        ) : events.map(event => (
                            <tr key={event.id} className="hover:bg-slate-700/30 transition-colors group">
                                <td className="p-4">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                                            {event.image_url ? (
                                                <img src={event.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-purple-500/20" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{event.title}</p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(event.start_time).toLocaleDateString()} • {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <MapPin size={14} className="text-slate-500" />
                                        <span className="truncate max-w-[150px]">{event.venue_name || "Online"}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${event.status === 'Active'
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-orange-500/10 text-orange-400'
                                        }`}>
                                        {event.status || 'Active'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="w-full max-w-[140px]">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-white">{event.registration_count}</span>
                                            <span className="text-slate-500">/{event.raw_data?.capacity || '∞'}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500 rounded-full"
                                                style={{ width: `${Math.min(((event.registration_count || 0) / (event.raw_data?.capacity || 100)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-slate-600 rounded-lg text-slate-300" title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-slate-600 rounded-lg text-primary-400" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-slate-600 rounded-lg text-red-400" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


import { useState, useEffect } from 'react';
import { Calendar, MapPin, Type, AlignLeft, Clock, Globe, X, Check, ChevronRight, ChevronLeft, Image as ImageIcon, Plus, Trash2, User, List, Link as LinkIcon, Twitter, Linkedin, Sparkles } from 'lucide-react';

export default function CreateEventModal({ isOpen, onClose, onSave, initialData = null }) {
    const [step, setStep] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "Business",
        description: "",
        startDate: "",
        startTime: "10:00",
        endDate: "",
        endTime: "12:00",
        mode: "offline", // or 'online'
        location: "",
        imageUrl: "",
        agendaItems: [],
        speakers: []
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            if (initialData) {
                // Populate form for Edit Mode
                setFormData({
                    ...initialData,
                    // Ensure dates are parsed correctly if coming from DB ISO strings
                    startDate: initialData.start_time ? initialData.start_time.split('T')[0] : "",
                    startTime: initialData.start_time ? initialData.start_time.split('T')[1].slice(0, 5) : "10:00",
                    endDate: initialData.end_time ? initialData.end_time.split('T')[0] : "",
                    endTime: initialData.end_time ? initialData.end_time.split('T')[1].slice(0, 5) : "12:00",
                    mode: initialData.online_event ? 'online' : 'offline',
                    location: initialData.venue_address || "",
                    imageUrl: initialData.image_url || "", // Map backend image_url to form imageUrl
                    agendaItems: initialData.raw_data?.agenda || [],
                    speakers: initialData.raw_data?.speakers || []
                });
            } else {
                // Reset for Create Mode
                setFormData({
                    title: "",
                    category: "Business",
                    description: "",
                    startDate: "",
                    startTime: "10:00",
                    endDate: "",
                    endTime: "12:00",
                    mode: "offline",
                    location: "",
                    imageUrl: "",
                    agendaItems: [],
                    speakers: []
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setStep(prev => prev + 1);
            setIsAnimating(false);
        }, 200);
    };

    const handleBack = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setStep(prev => prev - 1);
            setIsAnimating(false);
        }, 200);
    };

    const handleSubmit = async () => {
        // Construct final payload
        const payload = {
            ...formData,
            start_time: `${formData.startDate}T${formData.startTime}:00`,
            end_time: `${formData.endDate || formData.startDate}T${formData.endTime}:00`,
            is_free: true,
            venue_name: formData.mode === 'online' ? 'Online Event' : formData.location, // Simplified
            venue_address: formData.mode === 'online' ? 'Online' : formData.location,
            online_event: formData.mode === 'online',
            agenda: formData.agendaItems,
            speakers: formData.speakers,
            id: initialData?.id // Include ID if editing
        };
        await onSave(payload);
    };

    // --- Helpers for Agenda ---
    const addAgendaItem = () => {
        setFormData(prev => ({
            ...prev,
            agendaItems: [
                ...prev.agendaItems,
                { id: Date.now(), startTime: "", endTime: "", title: "", description: "" }
            ]
        }));
    };

    const removeAgendaItem = (id) => {
        setFormData(prev => ({
            ...prev,
            agendaItems: prev.agendaItems.filter(item => item.id !== id)
        }));
    };

    const updateAgendaItem = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            agendaItems: prev.agendaItems.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    // --- Helpers for Speakers ---
    const addSpeaker = () => {
        setFormData(prev => ({
            ...prev,
            speakers: [
                ...prev.speakers,
                { id: Date.now(), name: "", role: "", company: "", imageUrl: "", linkedIn: "", twitter: "" }
            ]
        }));
    };

    const removeSpeaker = (id) => {
        setFormData(prev => ({
            ...prev,
            speakers: prev.speakers.filter(item => item.id !== id)
        }));
    };

    const updateSpeaker = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            speakers: prev.speakers.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className="bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-700/50 relative animate-in zoom-in-95 duration-300 ring-1 ring-white/10">

                {/* DECORATIVE ELEMENTS */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* HEADER */}
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="text-primary-500" size={24} />
                            Create Event
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Craft your next big experience.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* STEP INDICATOR */}
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-primary-500 scale-110 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-slate-700'}`} />
                            ))}
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-slate-700 hover:border-slate-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar z-10 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

                    {/* STEP 1: BASICS */}
                    {step === 1 && (
                        <div className="space-y-8 max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Let's start with the basics</h3>
                                <p className="text-slate-400">Give your event a catchy title and category.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="group">
                                    <label className="text-sm font-medium text-slate-300 mb-2 block group-focus-within:text-primary-400 transition-colors">Event Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Future of Tech Summit 2026"
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium text-lg"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="text-sm font-medium text-slate-300 mb-2 block group-focus-within:text-primary-400 transition-colors">Category</label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer"
                                            >
                                                <option>Business</option>
                                                <option>Technology</option>
                                                <option>Startup</option>
                                                <option>Music</option>
                                                <option>Sports</option>
                                                <option>Arts</option>
                                                <option>Networking</option>
                                                <option>Education</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <ChevronRight className="rotate-90" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-sm font-medium text-slate-300 mb-2 block group-focus-within:text-primary-400 transition-colors">Cover Image URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                                            <input
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleChange}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="text-sm font-medium text-slate-300 mb-2 block group-focus-within:text-primary-400 transition-colors">Description</label>
                                    <div className="relative">
                                        <AlignLeft className="absolute left-4 top-6 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Tell people what your event is about. Using markdown is supported!"
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: LOGISTICS */}
                    {step === 2 && (
                        <div className="space-y-8 max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Time & Place</h3>
                                <p className="text-slate-400">When and where is this happening?</p>
                            </div>

                            {/* DATE CARD */}
                            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                                <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
                                    <Calendar className="text-primary-500" size={18} /> Schedule
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starts</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 text-sm"
                                            />
                                            <input
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime}
                                                onChange={handleChange}
                                                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ends</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 text-sm"
                                            />
                                            <input
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime}
                                                onChange={handleChange}
                                                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LOCATION CARD */}
                            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                                <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
                                    <MapPin className="text-primary-500" size={18} /> Venue
                                </h4>

                                <div className="flex gap-4 mb-6">
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, mode: 'offline' }))}
                                        className={`flex-1 py-4 px-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${formData.mode === 'offline'
                                            ? 'bg-primary-500/10 border-primary-500 text-primary-400 font-bold'
                                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <MapPin size={20} /> In Person Event
                                    </button>
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, mode: 'online' }))}
                                        className={`flex-1 py-4 px-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${formData.mode === 'online'
                                            ? 'bg-primary-500/10 border-primary-500 text-primary-400 font-bold'
                                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <Globe size={20} /> Virtual Event
                                    </button>
                                </div>

                                <div className={`transition-all duration-300 overflow-hidden ${formData.mode === 'offline' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Enter full venue address..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DETAILS */}
                    {step === 3 && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Content & Speakers</h3>
                                <p className="text-slate-400">Add the finer details to your event.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* AGENDA COLUMN */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <h3 className="text-white font-bold flex items-center gap-2">
                                            <List className="text-primary-500" size={20} /> Agenda
                                        </h3>
                                        <button onClick={addAgendaItem} className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-400 text-slate-900 flex items-center justify-center transition-colors shadow-lg shadow-primary-500/20">
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-3 h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                        {formData.agendaItems.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                                <List size={40} className="mb-2 opacity-20" />
                                                <p className="text-sm">No agenda items yet</p>
                                            </div>
                                        )}
                                        {formData.agendaItems.map((item) => (
                                            <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3 relative group hover:border-slate-600 transition-colors">
                                                <button onClick={() => removeAgendaItem(item.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="time"
                                                        value={item.startTime}
                                                        onChange={(e) => updateAgendaItem(item.id, 'startTime', e.target.value)}
                                                        className="bg-slate-900 border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-primary-500 w-20"
                                                    />
                                                    <span className="text-slate-500">-</span>
                                                    <input
                                                        type="time"
                                                        value={item.endTime}
                                                        onChange={(e) => updateAgendaItem(item.id, 'endTime', e.target.value)}
                                                        className="bg-slate-900 border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-primary-500 w-20"
                                                    />
                                                </div>
                                                <input
                                                    placeholder="Session Title"
                                                    value={item.title}
                                                    onChange={(e) => updateAgendaItem(item.id, 'title', e.target.value)}
                                                    className="w-full bg-transparent border-0 border-b border-slate-700 px-0 py-1 text-sm text-white focus:border-primary-500 focus:ring-0 placeholder:text-slate-600 font-medium"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SPEAKERS COLUMN */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <h3 className="text-white font-bold flex items-center gap-2">
                                            <User className="text-primary-500" size={20} /> Speakers
                                        </h3>
                                        <button onClick={addSpeaker} className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-400 text-slate-900 flex items-center justify-center transition-colors shadow-lg shadow-primary-500/20">
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-3 h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                        {formData.speakers.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                                <User size={40} className="mb-2 opacity-20" />
                                                <p className="text-sm">No speakers added yet</p>
                                            </div>
                                        )}
                                        {formData.speakers.map((item) => (
                                            <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 relative group hover:border-slate-600 transition-colors flex gap-4">
                                                <button onClick={() => removeSpeaker(item.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={14} />
                                                </button>

                                                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0">
                                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <User className="text-slate-600" size={20} />}
                                                </div>

                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <input
                                                        placeholder="Name"
                                                        value={item.name}
                                                        onChange={(e) => updateSpeaker(item.id, 'name', e.target.value)}
                                                        className="w-full bg-transparent border-0 border-b border-slate-700 px-0 py-0.5 text-sm text-white focus:border-primary-500 focus:ring-0 placeholder:text-slate-600 font-bold"
                                                    />
                                                    <input
                                                        placeholder="Role, Company"
                                                        value={item.role}
                                                        onChange={(e) => updateSpeaker(item.id, 'role', e.target.value)}
                                                        className="w-full bg-transparent border-0 px-0 py-0 text-xs text-slate-400 focus:text-white focus:ring-0 placeholder:text-slate-600"
                                                    />
                                                    <div className="flex gap-2 pt-1">
                                                        <input placeholder="Image URL" value={item.imageUrl} onChange={(e) => updateSpeaker(item.id, 'imageUrl', e.target.value)} className="flex-1 bg-slate-900 border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <div className="space-y-8 max-w-lg mx-auto text-center pt-8">
                            <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30 animate-in zoom-in spin-in-12 duration-500">
                                <Check className="text-white" size={48} />
                            </div>

                            <div>
                                <h3 className="text-3xl font-extrabold text-white mb-3">Almost There!</h3>
                                <p className="text-slate-400">
                                    Your event <strong className="text-white">{formData.title}</strong> is ready to launch.
                                    <br />Verify the details one last time.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-left space-y-4 shadow-xl">
                                <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
                                    <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-center leading-none">
                                        <span className="text-xs uppercase">{new Date(formData.startDate).toLocaleString('default', { month: 'short' })}<br /><span className="text-lg text-white">{new Date(formData.startDate).getDate()}</span></span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg leading-tight">{formData.title}</h4>
                                        <p className="text-sm text-primary-400">{formData.category}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex gap-3 text-slate-300">
                                        <Clock size={16} className="text-slate-500" />
                                        <span>{formData.startTime} - {formData.endTime}</span>
                                    </div>
                                    <div className="flex gap-3 text-slate-300">
                                        <MapPin size={16} className="text-slate-500" />
                                        <span className="truncate">{formData.mode === 'online' ? 'Online Event' : formData.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center z-10">
                    <button
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm"
                    >
                        {step === 1 ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
                    </button>

                    <button
                        onClick={step === 4 ? handleSubmit : handleNext}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all flex items-center gap-2 transform active:scale-95 duration-200 ${step === 4 ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/25' : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-primary-500/25'}`}
                    >
                        {step === 4 ? (
                            <>Publish Event <Sparkles size={16} /></>
                        ) : (
                            <>Next Step <ChevronRight size={16} /></>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

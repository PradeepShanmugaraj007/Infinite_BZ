import { useState, useEffect } from 'react';
import { Calendar, MapPin, Type, AlignLeft, Clock, Globe, X, Check, ChevronRight, ChevronLeft, Image as ImageIcon, Plus, Trash2, User, List, Link as LinkIcon, Twitter, Linkedin, Sparkles, Ticket } from 'lucide-react';
import TicketManager from './TicketManager';

export default function CreateEventModal({ isOpen, onClose, onSave, initialData = null }) {
    const [step, setStep] = useState(0); // Start at 0 for Mode Selection
    const [isAnimating, setIsAnimating] = useState(false);

    // AI Generation States
    const [generationMode, setGenerationMode] = useState('manual'); // 'manual' | 'ai'
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiTone, setAiTone] = useState("Professional");

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
        tickets: [] // List of { name, type, price, quantity, description }
    });

    useEffect(() => {
        if (isOpen) {
            setStep(0); // Always start at Mode Selection
            setGenerationMode('manual');
            setIsGenerating(false);
            setAiPrompt("");

            if (initialData) {
                setStep(1); // specific behavior for edit: skip mode selection
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
                    // Load tickets from raw_data or reconstruct from legacy fields
                    tickets: initialData.raw_data?.tickets_meta || [],
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
                    tickets: []
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
            venue_name: formData.mode === 'online' ? 'Online Event' : formData.location, // Simplified
            venue_address: formData.mode === 'online' ? 'Online' : formData.location,
            online_event: formData.mode === 'online',
            agenda: formData.agendaItems,
            tickets: formData.tickets, // Pass full ticket list to backend
            // Legacy fields calculated by backend now, but sending for safety if needed
            capacity: formData.tickets.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0),
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


    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);

        try {
            // Call Backend API
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ai/generate-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: aiPrompt,
                    category: formData.category
                })
            });

            if (!response.ok) throw new Error("AI Generation Failed");

            const data = await response.json();

            // Map AI Content to Form Data
            setFormData(prev => ({
                ...prev,
                title: aiPrompt,
                description: data.description || "",
                imageUrl: data.imageUrl || "",
                // Parse Agenda
                agendaItems: data.agenda?.map(item => ({
                    id: Date.now() + Math.random(),
                    startTime: item.startTime,
                    endTime: item.endTime,
                    title: item.title,
                    description: item.description
                })) || [],
                // We could also map tags if we had a field for it
            }));

            // Jump to Review Step (Step 5) to see the magic, or Step 1 to edit
            setStep(5);

        } catch (error) {
            console.error(error);
            alert("Failed to generate event. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className={`bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-700/50 relative transition-all duration-500 ring-1 ring-white/10 ${step === 0 ? 'max-w-2xl h-[500px]' : ''}`}>

                {/* DECORATIVE ELEMENTS */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* HEADER (Hide on Step 0 for cleaner look or Keep it) */}
                {step > 0 && (
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
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-primary-500 scale-110 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-slate-700'}`} />
                                ))}
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-slate-700 hover:border-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* CLOSE BTN FOR STEP 0 */}
                {step === 0 && (
                    <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                )}

                {/* CONTENT AREA */}
                <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar z-10 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

                    {/* STEP 0: MODE SELECTION */}
                    {step === 0 && (
                        <div className="h-full flex flex-col items-center justify-center space-y-12">
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">
                                    <Sparkles size={14} /> New Feature
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                    How would you like to build?
                                </h2>
                                <p className="text-slate-400 text-lg max-w-lg mx-auto">
                                    Start from scratch or let our AI draft the perfect event for you in seconds.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
                                {/* MANUAL CARD */}
                                <button
                                    onClick={() => handleNext()}
                                    className="group relative flex flex-col items-start p-8 rounded-3xl bg-slate-800/30 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/80 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-slate-900/50 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/0 to-slate-800/0 group-hover:from-slate-700/10 group-hover:to-slate-600/5 transition-all" />

                                    <div className="w-12 h-12 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-600">
                                        <Type size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Manual Creation</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        The classic way. Fill in every detail step-by-step to match your exact vision.
                                    </p>
                                    <div className="mt-auto pt-6 flex items-center text-sm font-bold text-slate-500 group-hover:text-white transition-colors">
                                        Start Building <ChevronRight size={16} className="ml-1" />
                                    </div>
                                </button>

                                {/* AI CARD */}
                                <button
                                    onClick={() => setGenerationMode('ai')}
                                    className={`group relative flex flex-col items-start p-8 rounded-3xl border transition-all duration-500 text-left overflow-hidden ${generationMode === 'ai' ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,255,196,0.15)]' : 'bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border-indigo-500/30 hover:border-indigo-400'}`}
                                >
                                    {/* Animated Background */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-400/30 transition-all" />

                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <Sparkles size={24} className="text-white animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">AI Magic Build</h3>
                                    <p className="text-indigo-200/70 text-sm leading-relaxed">
                                        Just type a title. We'll generate the description, agenda, tags, and cover image instantly.
                                    </p>

                                    {generationMode !== 'ai' && (
                                        <div className="mt-auto pt-6 flex items-center text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                            Try it out <ChevronRight size={16} className="ml-1" />
                                        </div>
                                    )}

                                    {/* AI INPUT EXPANSION */}
                                    <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${generationMode === 'ai' ? 'max-h-60 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                                        <div className="space-y-3" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                value={aiPrompt}
                                                onChange={e => setAiPrompt(e.target.value)}
                                                placeholder="e.g. AI Conf 2026..."
                                                className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-white placeholder:text-indigo-400/50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                                onKeyDown={e => e.key === 'Enter' && handleAIGenerate()}
                                            />
                                            <button
                                                onClick={handleAIGenerate}
                                                disabled={!aiPrompt || isGenerating}
                                                className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                            >
                                                {isGenerating ? (
                                                    <>Generating <span className="animate-spin">✨</span></>
                                                ) : (
                                                    <>Generate Event <Sparkles size={16} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* AI LOADING OVERLAY */}
                    {isGenerating && (
                        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Drafting your event...</h3>
                            <p className="text-slate-400 max-w-md">Our AI is writing a catchy description, planning the agenda, and finding the perfect cover image.</p>

                            <div className="mt-8 flex flex-col gap-2 w-full max-w-xs text-xs font-mono text-indigo-300/70">
                                <div className="flex items-center gap-2 opacity-50"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Analyzing Title...</div>
                                <div className="flex items-center gap-2 opacity-75"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Consulting Groq API...</div>
                                <div className="flex items-center gap-2 animate-pulse"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Applying Aesthetics...</div>
                            </div>
                        </div>
                    )}

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

                    {/* STEP 3: TICKETS (UPDATED) */}
                    {step === 3 && (
                        <div className="space-y-8 max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Ticket Details</h3>
                                <p className="text-slate-400">Manage your ticket configuration here.</p>
                            </div>

                            <TicketManager
                                tickets={formData.tickets}
                                onChange={(newTickets) => setFormData(p => ({ ...p, tickets: newTickets }))}
                            />
                        </div>
                    )}

                    {/* STEP 4: AGENDA (Previously Step 3) */}
                    {step === 4 && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Event Content</h3>
                                <p className="text-slate-400">Enrich your event page with an agenda.</p>
                            </div>

                            <div className="max-w-2xl mx-auto">
                                {/* AGENDA SECTION */}
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
                            </div>
                        </div>
                    )}

                    {/* STEP 5: REVIEW (Previously Step 4) */}
                    {step === 5 && (
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
                                    <div className="flex gap-3 text-slate-300 pt-2 border-t border-slate-700/50 mt-2">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                            <Ticket size={16} />
                                            {formData.tickets.length > 0
                                                ? `${formData.tickets.length} Ticket Types Configured`
                                                : "No Tickets Configured"}
                                        </div>
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
                        onClick={step === 5 ? handleSubmit : handleNext}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all flex items-center gap-2 transform active:scale-95 duration-200 ${step === 5 ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/25' : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-primary-500/25'}`}
                    >
                        {step === 5 ? (
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

import { useState } from 'react';
import { Calendar, MapPin, Type, AlignLeft, Clock, Globe, X, Check, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';

export default function CreateEventModal({ isOpen, onClose, onSave }) {
    const [step, setStep] = useState(1);
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
        imageUrl: ""
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        // Construct final payload
        const payload = {
            ...formData,
            start_time: `${formData.startDate}T${formData.startTime}:00`,
            end_time: `${formData.endDate || formData.startDate}T${formData.endTime}:00`,
            is_free: true, // Defaulting for now
            venue_name: formData.mode === 'online' ? 'Online Event' : formData.location,
            venue_address: formData.mode === 'online' ? 'Online' : formData.location,
            online_event: formData.mode === 'online'
        };
        await onSave(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">Create New Event</h2>
                        <p className="text-sm text-slate-400">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full h-1 bg-slate-700">
                    <div
                        className="h-full bg-primary-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8">

                    {/* STEP 1: DETAILS */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Type size={16} className="text-primary-500" /> Event Title
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Future of AI Summit 2026"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    >
                                        <option>Business</option>
                                        <option>Technology</option>
                                        <option>Startup</option>
                                        <option>Music</option>
                                        <option>Sports</option>
                                        <option>Arts</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <ImageIcon size={16} /> Cover Image URL
                                    </label>
                                    <input
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <AlignLeft size={16} /> Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Tell people what your event is about..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DATE & LOCATION */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-200">

                            {/* Date Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Calendar className="text-primary-500" size={20} /> Date & Time
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400">Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400">Start Time</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400">End Date</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400">End Time</label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-700" />

                            {/* Location Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <MapPin className="text-primary-500" size={20} /> Location
                                </h3>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, mode: 'offline' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.mode === 'offline'
                                                ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <MapPin size={18} /> In Person
                                    </button>
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, mode: 'online' }))}
                                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.mode === 'online'
                                                ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <Globe size={18} /> Virtual Event
                                    </button>
                                </div>

                                {formData.mode === 'offline' && (
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Enter venue address..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary-500 animate-in fade-in duration-200"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200 text-center">
                            <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="text-primary-500" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Ready to Publish?</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                Your event <strong>{formData.title}</strong> is ready to go public!
                                It will be visible to all users on the dashboard instantly.
                            </p>

                            <div className="bg-slate-900/50 p-6 rounded-xl text-left border border-slate-700 max-w-md mx-auto mt-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">When</span>
                                    <span className="text-white text-sm font-medium">{formData.startDate} @ {formData.startTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Where</span>
                                    <span className="text-white text-sm font-medium">{formData.mode === 'online' ? 'Online' : formData.location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Category</span>
                                    <span className="text-white text-sm font-medium">{formData.category}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-between">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2.5 rounded-xl font-bold bg-primary-500 hover:bg-primary-600 text-slate-900 shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-2.5 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                        >
                            Create Event <Check size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus, Trash2, ArrowLeft, Save, Loader2, Upload, Image as ImageIcon, Calendar, MapPin, Hash, Users, FileText, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface EventFormProps {
    eventId?: string;
}

interface Contact {
    name: string;
    phone: string;
}

export default function EventForm({ eventId }: EventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(!!eventId && eventId !== "new");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, watch } = useForm();

    const addContact = () => setContacts([...contacts, { name: "", phone: "" }]);

    const removeContact = (index: number) => {
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const updateContact = (index: number, field: keyof Contact, value: string) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPosterPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (eventId && eventId !== "new") {
            api.get(`/events/${eventId}`)
                .then(res => {
                    const data = res.data;
                    if (data.start_time) setValue("start_time", data.start_time.slice(0, 16));
                    if (data.end_time) setValue("end_time", data.end_time.slice(0, 16));
                    Object.keys(data).forEach(key => {
                        if (!['start_time', 'end_time', 'is_active'].includes(key)) {
                            setValue(key, data[key]);
                        }
                    });
                    setIsActive(data.is_active === 1 || data.is_active === true);
                    if (data.volunteer_contacts) {
                        try {
                            setContacts(JSON.parse(data.volunteer_contacts));
                        } catch (e) {
                            setContacts([]);
                        }
                    }
                    if (data.poster_file_id) {
                        setPosterPreview(`/api/events/${eventId}/poster`);
                    }
                })
                .finally(() => setFetchLoading(false));
        } else {
            setFetchLoading(false);
        }
    }, [eventId, setValue]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                is_active: isActive,
                volunteer_contacts: JSON.stringify(contacts)
            };

            if (eventId && eventId !== "new") {
                await api.put(`/events/${eventId}`, payload);
            } else {
                await api.post("/events", payload);
            }
            router.push("/dashboard/events");
        } catch (error) {
            alert("Error saving event");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/events" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                        <ArrowLeft className="h-4 w-4 text-zinc-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {eventId === "new" ? "Create New Event" : "Edit Event"}
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">Fill in the event details below</p>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">Status:</span>
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}
                    >
                        {isActive ? "● Active" : "○ Inactive"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Basic Info Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="h-5 w-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Event Name *</label>
                            <input
                                {...register("name", { required: true })}
                                className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="e.g. Battle of Bands 2026"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Category *</label>
                            <select
                                {...register("category", { required: true })}
                                className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Select Category</option>
                                <option value="Technical">🔧 Technical</option>
                                <option value="Cultural">🎭 Cultural</option>
                                <option value="General">📌 General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Venue</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    {...register("venue")}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. Main Auditorium"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                placeholder="Describe your event in detail..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Hashtags</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    {...register("hashtags")}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="#brahma26 #music"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Schedule</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Start Time *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    {...register("start_time", { required: true })}
                                    type="datetime-local"
                                    className="w-full bg-zinc-800/50 border border-zinc-700 pl-10 pr-4 py-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">End Time *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    {...register("end_time", { required: true })}
                                    type="datetime-local"
                                    className="w-full bg-zinc-800/50 border border-zinc-700 pl-10 pr-4 py-3 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="h-5 w-5 text-green-400" />
                        <h2 className="text-lg font-semibold text-white">Registration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Registration Fee</label>
                            <input
                                {...register("registration_fee")}
                                className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="e.g. ₹100 per team, Free"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Registration Link</label>
                            <input
                                {...register("registration_link")}
                                type="url"
                                className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="https://forms.google.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Media Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ImageIcon className="h-5 w-5 text-pink-400" />
                        <h2 className="text-lg font-semibold text-white">Media & Poster</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Event Poster</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                            >
                                {posterPreview ? (
                                    <div className="relative">
                                        <img
                                            src={posterPreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm">Click to change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <Upload className="h-10 w-10 text-zinc-600 mx-auto mb-3 group-hover:text-purple-400 transition-colors" />
                                        <p className="text-zinc-500 text-sm">Click to upload poster</p>
                                        <p className="text-zinc-600 text-xs mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Poster Caption */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Poster Caption</label>
                            <textarea
                                {...register("poster_caption")}
                                rows={6}
                                className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                placeholder="Caption that will appear with the poster in Telegram..."
                            />
                            <p className="text-xs text-zinc-600 mt-2">This caption will be sent along with the poster image in Telegram.</p>
                        </div>
                    </div>
                </div>

                {/* Rules Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                        <h2 className="text-lg font-semibold text-white">Rules & Guidelines</h2>
                    </div>

                    <textarea
                        {...register("rules")}
                        rows={5}
                        className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                        placeholder="1. Team size: 2-4 members&#10;2. Registration deadline: Jan 20&#10;3. No plagiarism allowed&#10;..."
                    />
                </div>

                {/* Contacts Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-400" />
                            <h2 className="text-lg font-semibold text-white">Volunteer Contacts</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addContact}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Contact
                        </button>
                    </div>

                    <div className="space-y-3">
                        {contacts.map((contact, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <input
                                    value={contact.name}
                                    onChange={(e) => updateContact(i, "name", e.target.value)}
                                    placeholder="Contact Name"
                                    className="flex-1 bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                <input
                                    value={contact.phone}
                                    onChange={(e) => updateContact(i, "phone", e.target.value)}
                                    placeholder="Phone Number"
                                    className="flex-1 bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeContact(i)}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {contacts.length === 0 && (
                            <div className="text-center py-8 text-zinc-600">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No contacts added yet</p>
                                <p className="text-xs mt-1">Click "Add Contact" to add volunteer info</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                    <Link
                        href="/dashboard/events"
                        className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {eventId === "new" ? "Create Event" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

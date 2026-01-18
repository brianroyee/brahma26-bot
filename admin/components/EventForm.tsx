"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface EventFormProps {
    eventId?: string; // "new" or number
}

interface Contact {
    name: string;
    phone: string;
}

export default function EventForm({ eventId }: EventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(!!eventId);
    const [contacts, setContacts] = useState<Contact[]>([]);

    const { register, handleSubmit, reset, setValue } = useForm();

    const addContact = () => setContacts([...contacts, { name: "", phone: "" }]);

    const removeContact = (index: number) => {
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const updateContact = (index: number, field: keyof Contact, value: string) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    useEffect(() => {
        if (eventId && eventId !== "new") {
            api.get(`/events/${eventId}`)
                .then(res => {
                    const data = res.data;
                    // Format dates for datetime-local input
                    if (data.start_time) setValue("start_time", data.start_time.slice(0, 16));
                    if (data.end_time) setValue("end_time", data.end_time.slice(0, 16));
                    // Set other fields
                    Object.keys(data).forEach(key => {
                        if (!['start_time', 'end_time'].includes(key)) {
                            setValue(key, data[key]);
                        }
                    });

                    if (data.volunteer_contacts) {
                        try {
                            setContacts(JSON.parse(data.volunteer_contacts));
                        } catch (e) {
                            setContacts([]);
                        }
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
            // Ensure ISO string for dates (append :00Z if needed, but backend takes simple string mostly)
            // Actually backend accepts what's sent, but let's be safe.
            // HTML datetime-local: "2026-01-25T10:00"

            const payload = {
                ...data,
                volunteer_contacts: JSON.stringify(contacts)
            };

            if (eventId && eventId !== "new") {
                await api.put(`/events/${eventId}`, payload);
            } else {
                await api.post("/events/", payload);
            }
            router.push("/dashboard/events");
        } catch (error) {
            alert("Error saving event");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/dashboard/events" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                    <ArrowLeft className="h-4 w-4 text-zinc-400" />
                </Link>
                <h1 className="text-2xl font-bold text-white">
                    {eventId === "new" ? "Create Event" : "Edit Event"}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="glass-card p-6 rounded-2xl border-zinc-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Event Name</label>
                            <input
                                {...register("name", { required: true })}
                                className="w-full glass-input px-4 py-2 rounded-lg text-white"
                                placeholder="e.g. Battle of Bands"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Category</label>
                            <select
                                {...register("category", { required: true })}
                                className="w-full glass-input px-4 py-2 rounded-lg text-white bg-zinc-900/50 [color-scheme:dark]"
                            >
                                <option value="">Select Category</option>
                                <option value="Technical">Technical</option>
                                <option value="Cultural">Cultural</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">Description</label>
                        <textarea
                            {...register("description")}
                            rows={4}
                            className="w-full glass-input px-4 py-2 rounded-lg text-white resize-none"
                            placeholder="Event details..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Venue</label>
                            <input
                                {...register("venue")}
                                className="w-full glass-input px-4 py-2 rounded-lg text-white"
                                placeholder="e.g. Main Auditorium"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Hashtags</label>
                            <input
                                {...register("hashtags")}
                                className="w-full glass-input px-4 py-2 rounded-lg text-white"
                                placeholder="#music #live"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Start Time</label>
                            <input
                                {...register("start_time", { required: true })}
                                type="datetime-local"
                                className="w-full glass-input px-4 py-2 rounded-lg text-white [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">End Time</label>
                            <input
                                {...register("end_time", { required: true })}
                                type="datetime-local"
                                className="w-full glass-input px-4 py-2 rounded-lg text-white [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">Rules</label>
                        <textarea
                            {...register("rules")}
                            rows={3}
                            className="w-full glass-input px-4 py-2 rounded-lg text-white resize-none"
                            placeholder="1. Team size..."
                        />
                    </div>
                </div>

                {/* Media & Contacts Section */}
                <div className="glass-card p-6 rounded-2xl border-zinc-800 space-y-6">
                    <h3 className="text-lg font-semibold text-white">Media & Contacts</h3>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">Poster Caption</label>
                        <textarea
                            {...register("poster_caption")}
                            rows={3}
                            className="w-full glass-input px-4 py-2 rounded-lg text-white resize-none"
                            placeholder="Caption for the Telegram poster..."
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-zinc-400">Volunteer Contacts</label>
                            <button
                                type="button"
                                onClick={addContact}
                                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <Plus className="h-3 w-3" /> Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {contacts.map((contact, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={contact.name}
                                        onChange={(e) => updateContact(i, "name", e.target.value)}
                                        placeholder="Name"
                                        className="flex-1 glass-input px-3 py-2 rounded-lg text-sm text-white"
                                    />
                                    <input
                                        value={contact.phone}
                                        onChange={(e) => updateContact(i, "phone", e.target.value)}
                                        placeholder="Phone"
                                        className="flex-1 glass-input px-3 py-2 rounded-lg text-sm text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeContact(i)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {contacts.length === 0 && (
                                <div className="text-zinc-600 text-xs italic text-center py-2">
                                    No contacts added
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href="/dashboard/events"
                        className="px-6 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        disabled={loading}
                        className="px-6 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Event
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, MapPin, Edit2, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get("/events/");
            setEvents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (error) {
            alert("Failed to delete event");
        }
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Events</h1>
                    <p className="text-zinc-400 mt-2">Manage festival events and schedules.</p>
                </div>
                <Link
                    href="/dashboard/events/new"
                    className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Event
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search events..."
                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading events...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card group hover:border-zinc-700 transition-colors rounded-2xl overflow-hidden"
                        >
                            {/* Poster Preview (if any) */}
                            <div className="h-40 bg-zinc-900 relative overflow-hidden">
                                {event.poster_file_id ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/events/${event.id}/poster`}
                                        alt={event.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                        <Calendar className="h-10 w-10 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-white">
                                    {event.category || "Uncategorized"}
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-bold text-white mb-2 truncate">{event.name}</h3>

                                <div className="space-y-2 text-sm text-zinc-400 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-zinc-600" />
                                        <span>{new Date(event.start_time).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-zinc-600" />
                                        <span>{event.venue || "TBD"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/50">
                                    <Link
                                        href={`/dashboard/events/${event.id}`}
                                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm text-center transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

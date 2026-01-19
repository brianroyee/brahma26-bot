"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, MapPin, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get("/events");
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

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.put(`/events/${id}`, { is_active: !currentStatus });
            fetchEvents();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.category?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === "active") return matchesSearch && e.is_active;
        if (filter === "inactive") return matchesSearch && !e.is_active;
        return matchesSearch;
    });

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Technical": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "Cultural": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
            case "General": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Events</h1>
                    <p className="text-zinc-400 mt-2">Manage festival events and schedules.</p>
                </div>
                <Link
                    href="/dashboard/events/new"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Add Event
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 bg-zinc-900/50 px-4 py-3 rounded-xl border border-zinc-800">
                    <Search className="h-5 w-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "active", "inactive"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
                <span className="text-zinc-500">
                    Total: <span className="text-white font-medium">{events.length}</span>
                </span>
                <span className="text-zinc-500">
                    Active: <span className="text-green-400 font-medium">{events.filter(e => e.is_active).length}</span>
                </span>
                <span className="text-zinc-500">
                    Showing: <span className="text-white font-medium">{filteredEvents.length}</span>
                </span>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">No events found</p>
                    <Link href="/dashboard/events/new" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
                        Create your first event →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className={`bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all hover:border-zinc-600 ${event.is_active ? "border-zinc-800" : "border-zinc-800/50 opacity-60"
                                }`}
                        >
                            {/* Card Header */}
                            <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 relative flex items-center justify-center">
                                <Calendar className="h-12 w-12 text-zinc-700" />
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(event.category)}`}>
                                        {event.category || "Uncategorized"}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={() => toggleStatus(event.id, event.is_active)}
                                        className={`p-1.5 rounded-lg transition-colors ${event.is_active
                                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                                : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                                            }`}
                                        title={event.is_active ? "Click to deactivate" : "Click to activate"}
                                    >
                                        {event.is_active ? (
                                            <ToggleRight className="h-4 w-4" />
                                        ) : (
                                            <ToggleLeft className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-white mb-3 truncate">{event.name}</h3>

                                <div className="space-y-2 text-sm text-zinc-400 mb-5">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-zinc-600" />
                                        <span>{event.start_time ? new Date(event.start_time).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : "TBD"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-zinc-600" />
                                        <span className="truncate">{event.venue || "Venue TBD"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/50">
                                    <Link
                                        href={`/dashboard/events/${event.id}`}
                                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-sm text-center transition-colors font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

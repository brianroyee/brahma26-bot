"use client";

import { useEffect, useState } from "react";
import { Trophy, Search, Calendar, Save, Loader2, ChevronDown, ChevronUp, Medal } from "lucide-react";
import api from "@/lib/api";

interface Event {
    id: number;
    name: string;
    category: string;
    start_time: string;
    results: string | null;
    is_active: boolean;
}

export default function ResultsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
    const [saving, setSaving] = useState<number | null>(null);
    const [results, setResults] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get("/events");
            const eventsData = res.data;
            setEvents(eventsData);

            // Initialize results state
            const resultsMap: Record<number, string> = {};
            eventsData.forEach((e: Event) => {
                resultsMap[e.id] = e.results || "";
            });
            setResults(resultsMap);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const saveResults = async (eventId: number) => {
        setSaving(eventId);
        try {
            await api.put(`/events/${eventId}`, {
                results: results[eventId]
            });
            alert("Results saved successfully!");
        } catch (error) {
            alert("Failed to save results");
        } finally {
            setSaving(null);
        }
    };

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Technical": return "text-blue-400";
            case "Cultural": return "text-pink-400";
            case "General": return "text-amber-400";
            default: return "text-zinc-400";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-amber-400" />
                    Event Results
                </h1>
                <p className="text-zinc-400 mt-2">Manage and announce winners for each event.</p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-3 rounded-xl border border-zinc-800">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search events..."
                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
                <span className="text-zinc-500">
                    Total Events: <span className="text-white font-medium">{events.length}</span>
                </span>
                <span className="text-zinc-500">
                    With Results: <span className="text-green-400 font-medium">
                        {events.filter(e => e.results && e.results.trim() !== "").length}
                    </span>
                </span>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-16">
                    <Trophy className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">No events found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
                        >
                            {/* Event Header */}
                            <button
                                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${event.results ? "bg-amber-500/20" : "bg-zinc-800"}`}>
                                        {event.results ? (
                                            <Medal className="h-5 w-5 text-amber-400" />
                                        ) : (
                                            <Trophy className="h-5 w-5 text-zinc-600" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-white">{event.name}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm">
                                            <span className={getCategoryColor(event.category)}>
                                                {event.category}
                                            </span>
                                            <span className="text-zinc-600">•</span>
                                            <span className="text-zinc-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {event.start_time ? new Date(event.start_time).toLocaleDateString() : "TBD"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {event.results && (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                            Results Added
                                        </span>
                                    )}
                                    {expandedEvent === event.id ? (
                                        <ChevronUp className="h-5 w-5 text-zinc-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-zinc-500" />
                                    )}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedEvent === event.id && (
                                <div className="p-4 pt-0 border-t border-zinc-800">
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                                            Event Results & Winners
                                        </label>
                                        <textarea
                                            value={results[event.id] || ""}
                                            onChange={(e) => setResults({ ...results, [event.id]: e.target.value })}
                                            rows={6}
                                            className="w-full bg-zinc-800/50 border border-zinc-700 px-4 py-3 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                            placeholder="🥇 1st Place: Team Alpha&#10;🥈 2nd Place: Team Beta&#10;🥉 3rd Place: Team Gamma&#10;&#10;Special Mention: Team Delta"
                                        />
                                        <p className="text-xs text-zinc-600 mt-2">
                                            Use emojis and formatting to make results look good. This will be displayed in the Telegram bot.
                                        </p>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => saveResults(event.id)}
                                            disabled={saving === event.id}
                                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {saving === event.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Save Results
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

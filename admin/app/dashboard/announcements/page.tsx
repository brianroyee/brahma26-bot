"use client";

import { useEffect, useState } from "react";
import { Megaphone, Send, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await api.get("/announcements/");
            setAnnouncements(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        if (!confirm("This will broadcast to ALL bot users. Continue?")) return;

        setSending(true);
        try {
            await api.post("/announcements/", { title, message });
            setTitle("");
            setMessage("");
            fetchAnnouncements();
            alert("Broadcast started!");
        } catch (err) {
            alert("Failed to send announcement");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Announcements</h1>
                <p className="text-zinc-400 mt-2">Broadcast messages to all bot users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Compose Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 rounded-2xl border-zinc-800 sticky top-8">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            New Broadcast
                        </h3>

                        <form onSubmit={handleSend} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-400">Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full glass-input px-4 py-2 rounded-lg text-white"
                                    placeholder="e.g. Schedule Change"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-400">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    className="w-full glass-input px-4 py-2 rounded-lg text-white resize-none"
                                    placeholder="Type your message here..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Broadcast Now
                            </button>

                            <p className="text-xs text-zinc-500 text-center">
                                This will send a direct message to all users who have started the bot.
                            </p>
                        </form>
                    </div>
                </div>

                {/* History List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">History</h3>
                    {loading ? (
                        <div className="text-zinc-500">Loading history...</div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-5 rounded-2xl border-zinc-800"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{item.title}</h4>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(item.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 text-sm whitespace-pre-wrap">{item.message}</p>
                                </motion.div>
                            ))}
                            {announcements.length === 0 && (
                                <div className="text-center py-12 text-zinc-600 italic">No announcements sent yet.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

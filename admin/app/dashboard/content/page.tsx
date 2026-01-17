"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function ContentPage() {
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await api.get("/content/");
            setContents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getLabel = (key: string) => {
        switch (key) {
            case "faq": return "Frequently Asked Questions";
            case "emergency_contacts": return "Emergency Contacts";
            case "about": return "About Section";
            default: return key;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Content Management</h1>
                <p className="text-zinc-400 mt-2">Manage static content for the bot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contents.map((item, i) => (
                    <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-2xl border-zinc-800 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{getLabel(item.key)}</h3>
                                <p className="text-xs text-zinc-500 font-mono mt-1">Key: {item.key}</p>
                                <p className="text-xs text-zinc-600 mt-1">Last updated: {new Date(item.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <Link
                            href={`/dashboard/content/${item.key}`}
                            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
                        >
                            <Edit2 className="h-5 w-5" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

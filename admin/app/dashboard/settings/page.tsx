"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Common settings keys we want to ensure exist in UI
    const defaultKeys: { key: string; description: string; value?: string }[] = [
        { key: "maintenance_mode", description: "Enable maintenance mode (true/false)", value: "" },
        { key: "contact_email", description: "Public contact email", value: "" },
        { key: "telegram_channel", description: "Main announcement channel ID", value: "" },
        { key: "welcome_message", description: "Welcome message for new users", value: "" }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get("/settings/");
            const fetched = res.data;

            // Merge defaults with fetched
            const merged = [...defaultKeys];
            fetched.forEach((f: any) => {
                const existing = merged.find(m => m.key === f.key);
                if (existing) {
                    existing.value = f.value;
                    existing.description = f.description || existing.description;
                } else {
                    merged.push(f);
                }
            });

            setSettings(merged.map(m => ({ ...m, value: m.value || "" })));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string, description: string) => {
        setSaving(true);
        try {
            await api.post("/settings/", { key, value, description });
            // Update local state to show saved
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
        } catch (error) {
            alert("Failed to save setting");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-zinc-400 mt-2">Configure system-wide parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {settings.map((setting, i) => (
                    <motion.div
                        key={setting.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card p-6 rounded-2xl border-zinc-800"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-white font-mono text-sm">{setting.key}</h3>
                                <p className="text-xs text-zinc-500 mt-1">{setting.description}</p>
                            </div>
                            <SettingsIcon className="h-4 w-4 text-zinc-600" />
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={setting.value}
                                onChange={(e) => {
                                    const newVal = e.target.value;
                                    setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: newVal } : s));
                                }}
                                className="flex-1 glass-input px-3 py-2 rounded-lg text-sm text-white"
                                placeholder="Value..."
                            />
                            <button
                                onClick={() => handleSave(setting.key, setting.value, setting.description)}
                                disabled={saving}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                            >
                                <Save className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

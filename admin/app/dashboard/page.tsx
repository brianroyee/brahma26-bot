"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell
} from "recharts";
import { Calendar, Users, Activity, Eye, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/telemetry/stats");
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading analytics...</div>;
    if (!stats) return <div className="p-8 text-red-400">Failed to load stats.</div>;

    const cards = [
        { label: "Total Users", value: stats.total_users || 0, icon: Users, color: "text-blue-400" },
        { label: "Total Events", value: stats.events || 0, icon: Calendar, color: "text-purple-400" },
        { label: "Active Events", value: stats.activeEvents || 0, icon: Activity, color: "text-green-400" },
        { label: "Interactions", value: stats.interactions || 0, icon: Eye, color: "text-amber-400" },
    ];

    const CHART_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-zinc-400 mt-2">Real-time insights from Brahma 26.</p>
            </div>

            {/* Stats Cards - Simplified, no heavy animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="glass-card p-6 rounded-2xl border border-zinc-800"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-400">{card.label}</p>
                                    <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-zinc-900/50 ${card.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Activity Chart */}
                <div className="glass-card p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-bold text-white mb-6">User Activity (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.recentActivity}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="action" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-500">
                                No activity data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="glass-card p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.slice(0, 5).map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                                    <span className="text-zinc-300">{item.action}</span>
                                    <span className="text-zinc-400">{item.count} times</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-500 text-center py-8">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

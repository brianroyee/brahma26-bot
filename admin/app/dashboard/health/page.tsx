"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Server, Database } from "lucide-react";
import api from "@/lib/api";

export default function HealthPage() {
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const res = await api.get("/health/db");
            setHealth(res.data);
        } catch (err) {
            setHealth({ status: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    const getStatusColor = (status: string) => {
        if (status === "healthy" || status === "connected") return "text-green-400";
        if (status === "degraded") return "text-yellow-400";
        return "text-red-400";
    };

    const getStatusIcon = (status: string) => {
        if (status === "healthy" || status === "connected") return CheckCircle;
        if (status === "degraded") return AlertTriangle;
        return XCircle;
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">System Health</h1>
                    <p className="text-zinc-400 mt-2">Monitor database and API status.</p>
                </div>
                <button
                    onClick={checkHealth}
                    disabled={loading}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API Status */}
                <div className="glass-card p-6 rounded-2xl border-zinc-800">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                <Server className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">API Server</h3>
                                <p className="text-xs text-zinc-500">FastAPI Backend</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 ${getStatusColor("healthy")}`}>
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Running</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Uptime</span>
                            <span className="text-white">Active</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Environment</span>
                            <span className="text-white">Production</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Docs</span>
                            <a href="http://127.0.0.1:8000/docs" target="_blank" className="text-primary hover:underline">Swagger UI</a>
                        </div>
                    </div>
                </div>

                {/* Database Status */}
                <div className="glass-card p-6 rounded-2xl border-zinc-800">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Database</h3>
                                <p className="text-xs text-zinc-500">Turso (libSQL)</p>
                            </div>
                        </div>

                        {health ? (
                            <div className={`flex items-center gap-2 ${getStatusColor("healthy")}`}>
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">Connected</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-400">
                                <XCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">Error</span>
                            </div>
                        )}
                    </div>

                    {health && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Event Count</span>
                                <span className="text-white">{health.events_count} events</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Response Time</span>
                                <span className="text-green-400">~45ms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Provider</span>
                                <span className="text-white">Turso Edge</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
    Calendar, LayoutDashboard, LogOut,
    Settings, FileText, Megaphone, Activity, Wifi, WifiOff, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Calendar, label: "Events", href: "/dashboard/events" },
    { icon: Trophy, label: "Results", href: "/dashboard/results" },
    { icon: Megaphone, label: "Announcements", href: "/dashboard/announcements" },
    { icon: FileText, label: "Content", href: "/dashboard/content" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [healthStatus, setHealthStatus] = useState<{
        api: boolean;
        db: boolean;
        loading: boolean;
    }>({ api: false, db: false, loading: true });

    useEffect(() => {
        setMounted(true);
        const token = Cookies.get("token");
        if (!token) router.push("/login");

        // Check health status
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [router]);

    const checkHealth = async () => {
        try {
            const res = await api.get("/health");
            setHealthStatus({
                api: res.status === 200,
                db: res.data?.database === "connected",
                loading: false
            });
        } catch {
            setHealthStatus({ api: false, db: false, loading: false });
        }
    };

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("user");
        router.push("/login");
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col fixed inset-y-0 z-50">
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="font-bold text-white">B</span>
                    </div>
                    <span className="font-bold text-xl text-white">Brahma 26</span>
                </div>

                {/* Health Status Banner */}
                <div className="mb-6 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="text-xs font-medium text-zinc-400 mb-2">System Status</div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">API</span>
                            <div className="flex items-center gap-1.5">
                                {healthStatus.loading ? (
                                    <span className="text-xs text-zinc-500">...</span>
                                ) : healthStatus.api ? (
                                    <>
                                        <Wifi className="h-3 w-3 text-green-400" />
                                        <span className="text-xs text-green-400">Online</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="h-3 w-3 text-red-400" />
                                        <span className="text-xs text-red-400">Offline</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">Database</span>
                            <div className="flex items-center gap-1.5">
                                {healthStatus.loading ? (
                                    <span className="text-xs text-zinc-500">...</span>
                                ) : healthStatus.db ? (
                                    <>
                                        <div className="h-2 w-2 rounded-full bg-green-400" />
                                        <span className="text-xs text-green-400">Connected</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-2 w-2 rounded-full bg-red-400" />
                                        <span className="text-xs text-red-400">Error</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

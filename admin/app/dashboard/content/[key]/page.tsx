"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function ContentEditorPage({ params }: { params: Promise<{ key: string }> }) {
    const router = useRouter();
    const [contentKey, setContentKey] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        params.then(p => {
            setContentKey(p.key);
            fetchContent(p.key);
        });
    }, [params]);

    const fetchContent = async (key: string) => {
        try {
            const res = await api.get(`/content/${key}`);
            const content = res.data.content;

            if (key === "about") {
                setData(content);
            } else {
                try {
                    setData(JSON.parse(content));
                } catch {
                    setData([]);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const saveContent = async () => {
        setLoading(true);
        try {
            const payload = {
                content: typeof data === "string" ? data : JSON.stringify(data)
            };
            await api.put(`/content/${contentKey}`, payload);
            router.push("/dashboard/content");
        } catch (error) {
            alert("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    // --- Type Specific Renderers ---

    const renderAbout = () => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">About Text</label>
            <textarea
                value={data || ""}
                onChange={(e) => setData(e.target.value)}
                rows={10}
                className="w-full glass-input p-4 rounded-xl text-white resize-none"
            />
        </div>
    );

    const renderFAQ = () => (
        <div className="space-y-4">
            <button
                onClick={() => setData([...data, { q: "", a: "" }])}
                className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Add Question
            </button>

            {data?.map((item: any, i: number) => (
                <div key={i} className="glass-card p-4 rounded-xl border-zinc-800 space-y-3 relative group">
                    <button
                        onClick={() => setData(data.filter((_: any, idx: number) => idx !== i))}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500">Question</label>
                        <input
                            value={item.q}
                            onChange={(e) => {
                                const newData = [...data];
                                newData[i].q = e.target.value;
                                setData(newData);
                            }}
                            className="w-full glass-input px-3 py-2 rounded-lg text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500">Answer</label>
                        <textarea
                            value={item.a}
                            onChange={(e) => {
                                const newData = [...data];
                                newData[i].a = e.target.value;
                                setData(newData);
                            }}
                            rows={2}
                            className="w-full glass-input px-3 py-2 rounded-lg text-white resize-none"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderContacts = () => (
        <div className="space-y-4">
            <button
                onClick={() => setData([...data, { name: "", phone: "" }])}
                className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Add Contact
            </button>

            {data?.map((item: any, i: number) => (
                <div key={i} className="glass-card p-4 rounded-xl border-zinc-800 flex gap-4 items-center">
                    <div className="flex-1 space-y-1">
                        <input
                            value={item.name}
                            onChange={(e) => {
                                const newData = [...data];
                                newData[i].name = e.target.value;
                                setData(newData);
                            }}
                            placeholder="Name"
                            className="w-full glass-input px-3 py-2 rounded-lg text-white"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <input
                            value={item.phone}
                            onChange={(e) => {
                                const newData = [...data];
                                newData[i].phone = e.target.value;
                                setData(newData);
                            }}
                            placeholder="Phone"
                            className="w-full glass-input px-3 py-2 rounded-lg text-white"
                        />
                    </div>
                    <button
                        onClick={() => setData(data.filter((_: any, idx: number) => idx !== i))}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );

    if (!data && typeof data !== "string") return <div className="p-8 text-zinc-500">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/content" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                        <ArrowLeft className="h-4 w-4 text-zinc-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white capitalize">{contentKey.replace("_", " ")}</h1>
                        <p className="text-zinc-400 text-sm">Edit content</p>
                    </div>
                </div>
                <button
                    onClick={saveContent}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>

            {contentKey === "about" && renderAbout()}
            {contentKey === "faq" && renderFAQ()}
            {contentKey === "emergency_contacts" && renderContacts()}
        </div>
    );
}

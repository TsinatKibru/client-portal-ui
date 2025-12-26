"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FolderKanban, Users, Clock, CheckCircle2, FileUp, RefreshCcw, MessageSquare } from "lucide-react";

const activityIcons: any = {
    FILE_UPLOAD: { icon: FileUp, color: "text-blue-600 bg-blue-50" },
    STATUS_CHANGE: { icon: RefreshCcw, color: "text-amber-600 bg-amber-50" },
    COMMENT_ADDED: { icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
};

export default function OverviewPage() {
    const [stats, setStats] = useState({
        totalClients: 0,
        activeProjects: 0,
        completedProjects: 0,
    });
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clients, projects, activityRes] = await Promise.all([
                    api.get("/clients"),
                    api.get("/projects"),
                    api.get("/activities/business"),
                ]);
                setStats({
                    totalClients: clients.data.length,
                    activeProjects: projects.data.filter((p: any) => p.status === "IN_PROGRESS").length,
                    completedProjects: projects.data.filter((p: any) => p.status === "DELIVERED").length,
                });
                setActivities(activityRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchData();
    }, []);

    const cards = [
        { label: "Total Clients", value: stats.totalClients, icon: Users, color: "var(--brand-primary)" },
        { label: "Active Jobs", value: stats.activeProjects, icon: Clock, color: "var(--brand-primary)" },
        { label: "Delivered", value: stats.completedProjects, icon: CheckCircle2, color: "var(--brand-primary)" },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--brand-soft)', color: card.color }}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest">{card.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1 text-black">{card.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-black">Recent Activity</h3>
                    <button className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--brand-primary)' }}>View all</button>
                </div>
                <div className="p-6">
                    <div className="space-y-6">
                        {activities.map((activity) => {
                            const Config = activityIcons[activity.type] || { icon: Clock, color: "text-slate-600 bg-slate-50" };
                            const Icon = Config.icon;
                            return (
                                <div key={activity.id} className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${Config.color} shrink-0`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {activity.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {activity.project?.title}
                                            </span>
                                            <span className="text-[10px] text-slate-300">•</span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {activities.length === 0 && (
                            <p className="text-slate-500 text-center py-12">No recent activity to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

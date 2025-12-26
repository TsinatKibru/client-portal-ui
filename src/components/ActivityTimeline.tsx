"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Clock, FileUp, RefreshCcw, MessageSquare, Loader2 } from "lucide-react";

interface Activity {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    user: {
        email: string;
    };
}

const activityIcons: any = {
    FILE_UPLOAD: { icon: FileUp, color: "text-blue-600 bg-blue-50" },
    STATUS_CHANGE: { icon: RefreshCcw, color: "text-amber-600 bg-amber-50" },
    COMMENT_ADDED: { icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
};

export function ActivityTimeline({ projectId }: { projectId: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await api.get(`/activities/project/${projectId}`);
                setActivities(res.data);
            } catch (err) {
                console.error("Failed to fetch activities", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [projectId]);

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-h-[500px] overflow-y-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Clock size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Project Activity</h3>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
                {activities.map((activity) => {
                    const Config = activityIcons[activity.type] || { icon: Clock, color: "text-slate-600 bg-slate-50" };
                    const Icon = Config.icon;

                    return (
                        <div key={activity.id} className="relative flex items-start gap-4">
                            <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-4 border-white z-10 ${Config.color}`}>
                                <Icon size={16} />
                            </div>
                            <div className="flex flex-col pt-1">
                                <p className="text-sm font-bold text-slate-900 leading-tight">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                        {new Date(activity.createdAt).toLocaleDateString()} • {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-[10px] text-slate-400">•</span>
                                    <span className="text-[10px] font-bold text-slate-500">
                                        {activity.user.email.split('@')[0]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {activities.length === 0 && (
                    <div className="text-center py-10 text-slate-400 italic text-sm">
                        No activity recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
}

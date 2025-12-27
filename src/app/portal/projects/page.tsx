"use client";

import { usePortalProjects } from "@/hooks/useQueries";
import { Briefcase, AlertCircle, Clock, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

const statusConfig: any = {
    PENDING: { label: "Pending", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100" },
    IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

export default function ClientProjectsPage() {
    const { data: projects = [], isLoading } = usePortalProjects();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 text-black">My Projects</h2>
                <p className="text-sm text-slate-500">{projects.length} Total Projects</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {projects.map((project: any) => {
                    const status = statusConfig[project.status];
                    const StatusIcon = status.icon;
                    return (
                        <Link
                            key={project.id}
                            href={`/portal/projects/${project.id}`}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all group flex items-center justify-between"
                            style={{ '--tw-hover-border-color': 'var(--brand-soft)' } as any}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.color.split(' ')[1]} ${status.color.split(' ')[0]}`}>
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 transition-colors text-black group-hover:opacity-80" style={{ '--tw-group-hover-text-color': 'var(--brand-primary)' } as any}>{project.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                                            <StatusIcon size={12} />
                                            {status.label}
                                        </div>
                                        <span className="text-xs text-slate-400">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 text-black">{project.files?.length || 0} Files</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Shared with you</p>
                                </div>
                                <ChevronRight className="text-slate-300 transition-colors" style={{ '--tw-group-hover-text-color': 'var(--brand-primary)' } as any} size={24} />
                            </div>
                        </Link>
                    );
                })}
                {projects.length === 0 && (
                    <div className="py-20 bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                        <Briefcase size={48} className="opacity-10 mb-4" />
                        <p className="font-medium">No projects available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

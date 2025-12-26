"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Plus, Search, Clock, CheckCircle2, AlertCircle, FileUp, FolderKanban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const statusConfig: any = {
    PENDING: { label: "Pending", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100" },
    IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ title: "", description: "", clientId: "" });
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        try {
            const [projRes, clientRes] = await Promise.all([
                api.get("/projects"),
                api.get("/clients"),
            ]);
            setProjects(projRes.data);
            setClients(clientRes.data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/projects", newProject);
            setIsModalOpen(false);
            toast.success("Project created successfully");
            setNewProject({ title: "", description: "", clientId: "" });
            fetchData();
        } catch (err) {
            console.error("Failed to create project", err);
            toast.error("Failed to create project");
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/projects/${id}/status`, { status });
            toast.success(`Status updated to ${status.replace('_', ' ')}`);
            fetchData();
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
        }
    };

    const handleDeleteProject = async (id: string) => {
        toast("Are you sure you want to delete this project?", {
            description: "All associated files will also be removed from the database.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await api.delete(`/projects/${id}`);
                        toast.success("Project deleted successfully");
                        fetchData();
                    } catch (err) {
                        console.error("Failed to delete project", err);
                        toast.error("Delete failed. Please try again.");
                    }
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => { },
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black text-sm"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:brightness-110 transition-all font-medium text-sm shadow-sm font-bold"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects
                    .filter(project =>
                        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        project.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((project) => {
                        const status = statusConfig[project.status];
                        const StatusIcon = status.icon;
                        return (
                            <div
                                key={project.id}
                                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 transition-all cursor-pointer group"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${status.color}`}>
                                            <StatusIcon size={12} />
                                            {status.label}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] text-slate-400 font-medium">#{project.id.slice(-6)}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProject(project.id);
                                                }}
                                                className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                                                title="Delete Project"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:opacity-80 transition-colors text-black" style={{ color: 'var(--brand-primary)' }}>{project.title}</h3>
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">{project.description || "No description provided."}</p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase" style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
                                                {project.client?.name[0]}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700">{project.client?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                id={`file-${project.id}`}
                                                className="hidden"
                                                onChange={async (e) => {
                                                    e.stopPropagation();
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append("file", file);
                                                    try {
                                                        await api.post(`/upload/${project.id}`, formData);
                                                        toast.success("File uploaded");
                                                        fetchData();
                                                    } catch (err) {
                                                        toast.error("Upload failed");
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`file-${project.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:opacity-80"
                                                style={{ color: 'var(--brand-primary)' }}
                                            >
                                                <FileUp size={14} />
                                                Upload
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => updateStatus(project.id, "IN_PROGRESS")}
                                        className={`flex-1 text-[10px] font-bold uppercase border py-1.5 rounded transition-colors ${project.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {project.status === 'IN_PROGRESS' ? 'In Progress' : 'Start Work'}
                                    </button>
                                    <button
                                        onClick={() => updateStatus(project.id, "DELIVERED")}
                                        className={`flex-1 text-[10px] font-bold uppercase border py-1.5 rounded transition-colors ${project.status === 'DELIVERED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {project.status === 'DELIVERED' ? 'Delivered' : 'Deliver'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                {projects.length === 0 && (
                    <div className="col-span-full py-20 bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                        <FolderKanban size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">No projects yet. Start by creating one!</p>
                    </div>
                )}
            </div>

            {/* Basic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">New Project</h3>
                        <p className="text-slate-500 mb-6">Create a new job and assign it to a client.</p>

                        <form onSubmit={handleCreateProject} className="space-y-4 text-black text-black">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Website Design"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
                                <select
                                    required
                                    value={newProject.clientId}
                                    onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a client...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Brief project details..."
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

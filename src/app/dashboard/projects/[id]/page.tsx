"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { FolderKanban, AlertCircle, Clock, CheckCircle2, FileText, Download, ArrowLeft, Upload, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CommentSection } from "@/components/CommentSection";
import { ActivityTimeline } from "@/components/ActivityTimeline";

const statusConfig: any = {
    PENDING: { label: "Pending", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100" },
    IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

export default function AdminProjectDetailPage() {
    const params = useParams();
    const [project, setProject] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
    const router = useRouter();

    const handleDownload = async (file: any) => {
        setDownloadingFile(file.id);
        try {
            const response = await fetch(file.url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const contentType = response.headers.get("content-type");
            if (contentType?.includes("text/plain") || contentType?.includes("text/html")) {
                throw new Error("Cloudinary returned an error instead of the file. Check your settings.");
            }

            const blob = await response.blob();
            const typedBlob = new Blob([blob], { type: file.type });
            const url = window.URL.createObjectURL(typedBlob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Download failed", err);
            const fallbackUrl = file.url.includes('/image/upload/')
                ? file.url.replace('/upload/', '/upload/fl_attachment/')
                : file.url;
            window.open(fallbackUrl, '_blank');
        } finally {
            setDownloadingFile(null);
        }
    };

    const handleDeleteFile = (fileId: string) => {
        toast("Are you sure you want to delete this file?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    setDeletingFile(fileId);
                    try {
                        await api.delete(`/upload/${project.id}/delete/${fileId}`);
                        toast.success("File deleted successfully");
                        fetchProject();
                    } catch (err: any) {
                        console.error("Delete failed", err);
                        const msg = err.response?.data?.message || err.message || "Unknown error";
                        toast.error(`Delete failed: ${msg}`);
                    } finally {
                        setDeletingFile(null);
                    }
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => { },
            },
        });
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/projects/${id}/status`, { status });
            toast.success(`Status updated to ${status.replace('_', ' ')}`);
            fetchProject();
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
        }
    };

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${params.id}`);
            setProject(res.data);
        } catch (err) {
            console.error("Failed to fetch project detail", err);
            router.push("/dashboard/projects");
        }
    };

    useEffect(() => {
        fetchProject();
    }, [params.id, router]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post(`/upload/${project.id}`, formData);
            toast.success("File uploaded successfully");
            fetchProject();
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (!project) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--brand-primary)' }} /></div>;

    const status = statusConfig[project.status];
    const StatusIcon = status.icon;

    return (
        <div className="space-y-8">
            <Link href="/dashboard/projects" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:opacity-80 transition-opacity" style={{ color: 'var(--brand-primary)' }}>
                <ArrowLeft size={16} />
                Back to Projects
            </Link>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden text-black">
                <div className="absolute top-0 right-0 p-8">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                    </div>
                </div>

                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 truncate">{project.title}</h2>
                    <p className="text-sm font-medium text-slate-400 mb-6 italic">Client: {project.client?.name}</p>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {project.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                        <div>
                            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Created On</p>
                            <p className="font-bold text-slate-700">{new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Status</p>
                            <div className="flex gap-2 mt-1">
                                {project.status === 'PENDING' && (
                                    <button
                                        onClick={() => updateStatus(project.id, "IN_PROGRESS")}
                                        className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                                    >
                                        Start Work
                                    </button>
                                )}
                                {project.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => updateStatus(project.id, "DELIVERED")}
                                        className="px-4 py-1.5 bg-emerald-600 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                                    >
                                        Deliver Project
                                    </button>
                                )}
                                {project.status === 'DELIVERED' && (
                                    <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                                        <CheckCircle2 size={16} />
                                        Project Delivered
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 text-black">Project Files</h3>
                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold text-xs cursor-pointer shadow-lg shadow-slate-200">
                            {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                            Upload New File
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.files?.map((file: any) => (
                            <div key={file.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors text-black">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors" style={{ color: 'var(--brand-primary)' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 truncate" title={file.name}>{file.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">{file.type.split('/')[1]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleDownload(file)}
                                        disabled={downloadingFile === file.id}
                                        className="p-2 text-slate-300 transition-colors disabled:opacity-50 hover:opacity-80"
                                        style={{ color: 'var(--brand-primary)' }}
                                        title="Download"
                                    >
                                        {downloadingFile === file.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Download size={16} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFile(file.id)}
                                        disabled={deletingFile === file.id}
                                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {deletingFile === file.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {project.files?.length === 0 && (
                            <div className="col-span-full py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 italic">
                                No files uploaded yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 text-black">Shared With</h3>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-black">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
                                {project.client?.name[0]}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{project.client?.name}</p>
                                <p className="text-xs text-slate-500">{project.client?.email}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Portal Access</p>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-xs font-bold text-slate-600">Client can view this project</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collaboration & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div className="space-y-6">
                    <CommentSection projectId={project.id} />
                </div>
                <div className="space-y-6">
                    <ActivityTimeline projectId={project.id} />
                </div>
            </div>
        </div>
    );
}

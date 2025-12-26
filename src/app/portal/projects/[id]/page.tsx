"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Briefcase, AlertCircle, Clock, CheckCircle2, FileText, Download, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { CommentSection } from "@/components/CommentSection";
import { ActivityTimeline } from "@/components/ActivityTimeline";

const statusConfig: any = {
    PENDING: { label: "Pending", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100" },
    IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

const getDownloadUrl = (file: any) => {
    if (file.url.includes('cloudinary.com') && file.url.includes('/upload/')) {
        return file.url.replace('/upload/', '/upload/fl_attachment/');
    }
    return file.url;
};

export default function ClientProjectDetailPage() {
    const params = useParams();
    const [project, setProject] = useState<any>(null);
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
    const router = useRouter();

    const handleDownload = async (file: any) => {
        setDownloadingFile(file.id);
        try {
            // Use the original URL to get the actual file bytes
            const response = await fetch(file.url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const contentType = response.headers.get("content-type");
            // If we expect a PDF/image but get text/plain, it's likely a Cloudinary error message
            if (contentType?.includes("text/plain") || contentType?.includes("text/html")) {
                const text = await response.text();
                console.error("Cloudinary returned a text response instead of a file:", text);
                throw new Error("Cloudinary returned an error message. Check your Security settings.");
            }

            const blob = await response.blob();
            // Re-wrap with the stored MIME type to ensure OS correctly identifies it
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
            alert("Download failed: " + err.message + "\nPlease ensure 'Allow delivery of PDF/ZIP' is enabled in Cloudinary settings.");
            // Final fallback: try to use fl_attachment in a new tab if it's an image asset,
            // otherwise just open the original URL
            const fallbackUrl = file.url.includes('/image/upload/')
                ? file.url.replace('/upload/', '/upload/fl_attachment/')
                : file.url;
            window.open(fallbackUrl, '_blank');
        } finally {
            setDownloadingFile(null);
        }
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/projects/${params.id}`);
                console.log("Client Project Detail Raw Response:", res.data); // Diagnostic
                setProject(res.data);
            } catch (err) {
                console.error("Failed to fetch project detail", err);
                router.push("/portal/projects");
            }
        };
        fetchProject();
    }, [params.id, router]);

    if (!project) return null;

    const status = statusConfig[project.status];
    const StatusIcon = status.icon;

    return (
        <div className="space-y-8">
            <Link href="/portal/projects" className="flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:opacity-80" style={{ color: 'var(--brand-primary)' }}>
                <ArrowLeft size={16} />
                Back to Projects
            </Link>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                    </div>
                </div>

                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 text-black">{project.title}</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {project.description || "No description provided for this project."}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <div>
                            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Created On</p>
                            <p className="font-bold text-slate-700">{new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-widest mb-1">Last Update</p>
                            <p className="font-bold text-slate-700">{new Date(project.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 text-black">Shared Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.files?.map((file: any) => (
                        <div key={file.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group transition-colors" style={{ '--tw-hover-border-color': 'var(--brand-soft)' } as any}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors" style={{ color: 'var(--brand-primary)' }}>
                                    <FileText size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-900 truncate text-black" title={file.name}>{file.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{file.type.split('/')[1]}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(file)}
                                disabled={downloadingFile === file.id}
                                className="p-2 text-slate-300 transition-colors disabled:opacity-50 hover:opacity-80"
                                style={{ color: 'var(--brand-primary)' }}
                                title="Download"
                            >
                                {downloadingFile === file.id ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Download size={20} />
                                )}
                            </button>
                        </div>
                    ))}
                    {project.files?.length === 0 && (
                        <div className="col-span-full py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 italic">
                            No files have been shared yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <CommentSection projectId={project.id} />
                <ActivityTimeline projectId={project.id} />
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FileText, Download, Trash2, Search, Loader2, Folder, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function FilesPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

    const fetchFiles = async () => {
        try {
            const res = await api.get("/projects/all/files");
            setFiles(res.data);
        } catch (err) {
            console.error("Failed to fetch files", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
        e.preventDefault();
        e.stopPropagation();

        toast("Are you sure you want to delete this file?", {
            action: {
                label: "Delete",
                onClick: async () => {
                    setDeletingFile(fileId);
                    try {
                        console.log("Attempting to delete file:", fileId);
                        const res = await api.delete(`/upload/delete-any/${fileId}`);
                        console.log("Delete response:", res.data);
                        toast.success("File deleted successfully");
                        setFiles(prev => prev.filter(f => f.id !== fileId));
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

    const handleDownload = async (e: React.MouseEvent, file: any) => {
        e.preventDefault();
        e.stopPropagation();
        setDownloadingFile(file.id);

        try {
            const response = await fetch(file.url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const contentType = response.headers.get("content-type");
            if (contentType?.includes("text/plain") || contentType?.includes("text/html")) {
                throw new Error("Could not download file directly. Try opening it in a new tab.");
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
            // Fallback
            const fallbackUrl = file.url.includes('/image/upload/')
                ? file.url.replace('/upload/', '/upload/fl_attachment/')
                : file.url;
            window.open(fallbackUrl, '_blank');
        } finally {
            setDownloadingFile(null);
        }
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.project?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Grouping files by project ID to avoid name collisions
    const groupedFiles = filteredFiles.reduce((acc: any, file) => {
        const projectId = file.project?.id || "unassigned";
        const projectTitle = file.project?.title || "General / Unassigned";

        if (!acc[projectId]) {
            acc[projectId] = { title: projectTitle, id: file.project?.id, files: [] };
        }
        acc[projectId].files.push(file);
        return acc;
    }, {});

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin" style={{ color: 'var(--brand-primary)' }} size={32} />
            <p className="text-slate-500 font-medium">Loading your files...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 text-black">Shared Files</h2>
                    <p className="text-slate-500 text-sm">Manage all files uploaded across your projects.</p>
                </div>
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search files or projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 text-black text-sm shadow-sm"
                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                    />
                </div>
            </div>

            {Object.keys(groupedFiles).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(groupedFiles).map(([id, data]: [string, any]) => (
                        <div key={id} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <Folder style={{ color: 'var(--brand-primary)' }} size={20} />
                                    <h3 className="font-bold text-slate-800 text-black">{data.title}</h3>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        {data.files.length} {data.files.length === 1 ? 'file' : 'files'}
                                    </span>
                                </div>
                                {data.id && (
                                    <Link
                                        href={`/dashboard/projects/${data.id}`}
                                        className="text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                                        style={{ color: 'var(--brand-primary)' }}
                                    >
                                        View Project <ExternalLink size={12} />
                                    </Link>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-1/2">File Name</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date Added</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.files.map((file: any) => (
                                            <tr key={file.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-white transition-colors" style={{ color: 'var(--brand-primary)' }}>
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 text-black truncate max-w-xs">{file.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                                                        {file.type.split('/')[1] || file.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                                    {new Date(file.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={(e) => handleDownload(e, file)}
                                                            disabled={downloadingFile === file.id}
                                                            className="p-2 text-slate-400 transition-colors disabled:opacity-50 hover:opacity-80"
                                                            style={{ color: 'var(--brand-primary)' }}
                                                            title="Download File"
                                                        >
                                                            {downloadingFile === file.id ? (
                                                                <Loader2 className="animate-spin" size={18} />
                                                            ) : (
                                                                <Download size={18} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteFile(e, file.id)}
                                                            disabled={deletingFile === file.id}
                                                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                                                            title="Delete File"
                                                        >
                                                            {deletingFile === file.id ? (
                                                                <Loader2 className="animate-spin" size={18} />
                                                            ) : (
                                                                <Trash2 size={18} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 bg-white border border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} className="opacity-20" />
                    </div>
                    <p className="font-bold">No files found.</p>
                    <p className="text-sm">Try adjusting your search or check again later.</p>
                </div>
            )}
        </div>
    );
}

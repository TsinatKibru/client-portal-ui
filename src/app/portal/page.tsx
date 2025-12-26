"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Briefcase, FileText, CheckCircle2, Clock, AlertCircle, Download, ExternalLink } from "lucide-react";

const statusConfig: any = {
    PENDING: { label: "Pending", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100" },
    IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

export default function PortalDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projRes, invRes] = await Promise.all([
                    api.get("/portal/projects"),
                    api.get("/portal/invoices"),
                ]);
                setProjects(projRes.data);
                setInvoices(invRes.data);
            } catch (err) {
                console.error("Failed to fetch portal data", err);
            }
        };
        fetchData();
    }, []);

    const downloadPdf = async (id: string) => {
        try {
            const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download PDF", err);
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1 leading-none">Active Projects</p>
                        <h3 className="text-3xl font-bold text-slate-900 text-black">
                            {projects.filter(p => p.status !== 'DELIVERED').length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
                        <Briefcase size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1 leading-none">Unpaid Invoices</p>
                        <h3 className="text-3xl font-bold text-slate-900 text-black">
                            {invoices.filter(i => i.status !== 'PAID').length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                        <FileText size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Projects Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 text-black">My Projects</h2>
                        <Link href="/portal/projects" className="text-xs font-bold hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--brand-primary)' }}>
                            View All <ExternalLink size={12} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {projects.slice(0, 3).map((project) => {
                            const status = statusConfig[project.status];
                            const StatusIcon = status.icon;
                            return (
                                <div key={project.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1 text-black">{project.title}</h4>
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-flex ${status.color}`}>
                                            <StatusIcon size={10} />
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 mb-1">Files: {project.files?.length || 0}</p>
                                        <Link href={`/portal/projects/${project.id}`} className="text-xs font-bold group-hover:underline" style={{ color: 'var(--brand-primary)' }}>Details</Link>
                                    </div>
                                </div>
                            );
                        })}
                        {projects.length === 0 && (
                            <div className="py-12 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                                <p className="text-sm">No projects assigned yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoices Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 text-black">Latest Invoices</h2>
                        <Link href="/portal/invoices" className="text-xs font-bold hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--brand-primary)' }}>
                            View All <ExternalLink size={12} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {invoices.slice(0, 3).map((invoice) => (
                            <div key={invoice.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1 text-black">{invoice.invoiceNumber}</h4>
                                    <p className="text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 text-black">${invoice.amount.toFixed(2)}</p>
                                        <p className={`text-[10px] font-bold uppercase ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {invoice.status}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => downloadPdf(invoice.id)}
                                        className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-slate-100 transition-all hover:opacity-80"
                                        style={{ color: 'var(--brand-primary)' }}
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {invoices.length === 0 && (
                            <div className="py-12 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                                <p className="text-sm">No invoices found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to avoid Import error in case next/link is used without importing
import Link from "next/link";

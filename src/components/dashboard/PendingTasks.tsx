"use client";

import { AlertCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PendingTasksProps {
    data: {
        overdueInvoices: any[];
        activeProjects: any[];
    };
}

export default function PendingTasks({ data }: PendingTasksProps) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Attention Required</h3>
            </div>

            <div className="divide-y divide-slate-50">
                {/* Overdue Invoices */}
                {data.overdueInvoices.length > 0 && data.overdueInvoices.map(invoice => (
                    <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <AlertCircle size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Overdue: {invoice.invoiceNumber}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{invoice.client?.name}</p>
                            </div>
                        </div>
                        <Link href={`/dashboard/invoices`} className="text-slate-300 hover:text-slate-600">
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                ))}

                {/* Active Projects */}
                {data.activeProjects.length > 0 && data.activeProjects.map(project => (
                    <div key={project.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{project.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{project.client?.name}</p>
                            </div>
                        </div>
                        <Link href={`/dashboard/projects`} className="text-slate-300 hover:text-slate-600">
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                ))}

                {data.overdueInvoices.length === 0 && data.activeProjects.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <p className="text-sm font-semibold">Everything is up to date!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

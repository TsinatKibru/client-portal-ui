"use client";

import { usePortalInvoices, useBusinessProfile } from "@/hooks/useQueries";
import api from "@/lib/api";
import { FileText, Download, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

const statusConfig: any = {
    SENT: { label: "Sent", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    PAID: { label: "Paid", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

export default function ClientInvoicesPage() {
    const { data: invoices = [], isLoading } = usePortalInvoices();
    const { data: business } = useBusinessProfile();

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

    const currencySymbol = business?.currency === 'EUR' ? '€' : business?.currency === 'GBP' ? '£' : '$';

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
                <h2 className="text-2xl font-bold text-slate-900 text-black">Invoices & Payments</h2>
                <p className="text-sm text-slate-500">{invoices.length} Total Invoices</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices.map((invoice: any) => {
                            const status = statusConfig[invoice.status];
                            const StatusIcon = status.icon;
                            return (
                                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 text-black">
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-black">
                                        {currencySymbol}{invoice.total?.toFixed(2) || invoice.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-flex ${status.color}`}>
                                            <StatusIcon size={12} />
                                            {status.label}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(invoice.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => downloadPdf(invoice.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-bold text-xs hover:brightness-110"
                                            style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' }}
                                        >
                                            <Download size={14} />
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No invoices available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

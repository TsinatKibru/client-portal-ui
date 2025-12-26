"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Search, FileText, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";

const statusConfig: any = {
    DRAFT: { label: "Draft", icon: AlertCircle, color: "text-slate-600 bg-slate-50 border-slate-100" },
    SENT: { label: "Sent", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
    PAID: { label: "Paid", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        clientId: "",
        status: "DRAFT",
        lineItems: [{ description: "", quantity: 1, rate: 0, tax: 0 }]
    });

    const [business, setBusiness] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [invRes, clientRes, bizRes] = await Promise.all([
                api.get("/invoices"),
                api.get("/clients"),
                api.get("/business/profile")
            ]);
            setInvoices(invRes.data);
            setClients(clientRes.data);
            setBusiness(bizRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/invoices", newInvoice);
            setIsModalOpen(false);
            setNewInvoice({
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                clientId: "",
                status: "DRAFT",
                lineItems: [{ description: "", quantity: 1, rate: 0, tax: 0 }]
            });
            fetchData();
        } catch (err) {
            console.error("Failed to create invoice", err);
        }
    };

    const addLineItem = () => {
        setNewInvoice({
            ...newInvoice,
            lineItems: [...newInvoice.lineItems, { description: "", quantity: 1, rate: 0, tax: 0 }]
        });
    };

    const updateLineItem = (index: number, field: string, value: any) => {
        const updated = [...newInvoice.lineItems];
        updated[index] = { ...updated[index], [field]: value };
        setNewInvoice({ ...newInvoice, lineItems: updated });
    };

    const removeLineItem = (index: number) => {
        if (newInvoice.lineItems.length === 1) return;
        const updated = newInvoice.lineItems.filter((_, i) => i !== index);
        setNewInvoice({ ...newInvoice, lineItems: updated });
    };

    const calculateSubtotal = () => {
        return newInvoice.lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    };

    const calculateTax = () => {
        return newInvoice.lineItems.reduce((acc, item) => acc + (item.quantity * item.rate * (item.tax / 100)), 0);
    };

    const currencySymbol = business?.currency === 'EUR' ? '€' : business?.currency === 'GBP' ? '£' : '$';

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

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/invoices/${id}/status`, { status });
            fetchData();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-black text-sm"
                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:brightness-110 transition-all font-medium text-sm shadow-sm"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    <Plus size={18} />
                    Create Invoice
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices.map((invoice) => {
                            const status = statusConfig[invoice.status];
                            const StatusIcon = status.icon;
                            return (
                                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900 border-l-4 border-transparent text-black" style={{ '--tw-group-hover-border-color': 'var(--brand-primary)' } as any}>
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900 text-black">{invoice.client?.name}</div>
                                        <div className="text-xs text-slate-500">{invoice.client?.email}</div>
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
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => downloadPdf(invoice.id)}
                                            className="p-1.5 text-slate-400 hover:opacity-80 transition-opacity"
                                            style={{ color: 'var(--brand-primary)' }}
                                            title="Download PDF"
                                        >
                                            <Download size={18} />
                                        </button>
                                        {invoice.status !== 'PAID' && (
                                            <button
                                                onClick={() => updateStatus(invoice.id, 'PAID')}
                                                className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                                title="Mark as Paid"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText size={48} className="opacity-10" />
                                        <p>No invoices found. Create your first invoice to get paid!</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Basic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">New Invoice</h3>
                                <p className="text-slate-500 text-sm">Create a billing statement for your client.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice #</span>
                                <p className="font-mono font-bold" style={{ color: 'var(--brand-primary)' }}>{newInvoice.invoiceNumber}</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateInvoice} className="space-y-6 text-black">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                                <label className="block text-sm font-bold text-slate-700">Client Details</label>
                                <select
                                    required
                                    value={newInvoice.clientId}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                                >
                                    <option value="">Choose a client...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Line Items</label>
                                    <button
                                        type="button"
                                        onClick={addLineItem}
                                        className="text-xs font-bold flex items-center gap-1 hover:opacity-80"
                                        style={{ color: 'var(--brand-primary)' }}
                                    >
                                        <Plus size={14} /> Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {newInvoice.lineItems.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                                            <div className="col-span-12 md:col-span-5">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => updateLineItem(index, "description", e.target.value)}
                                                    placeholder="Service or item name"
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div className="col-span-3 md:col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value))}
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div className="col-span-5 md:col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rate</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    value={item.rate}
                                                    onChange={(e) => updateLineItem(index, "rate", parseFloat(e.target.value))}
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div className="col-span-3 md:col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tax %</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={item.tax}
                                                    onChange={(e) => updateLineItem(index, "tax", parseFloat(e.target.value))}
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center pb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLineItem(index)}
                                                    className="text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <AlertCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span>{currencySymbol}{calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Estimated Tax</span>
                                        <span>{currencySymbol}{calculateTax().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                                        <span>Total</span>
                                        <span style={{ color: 'var(--brand-primary)' }}>{currencySymbol}{(calculateSubtotal() + calculateTax()).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 text-white font-bold rounded-lg hover:brightness-110 shadow-lg transition-all"
                                    style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 15px -3px var(--brand-soft)' }}
                                >
                                    Create Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

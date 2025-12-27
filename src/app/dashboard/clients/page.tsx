"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Plus, Search, Mail, Phone, MoreVertical, Key, CheckCircle2, ShieldOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useClients } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";

export default function ClientsPage() {
    const queryClient = useQueryClient();
    const { data: clients = [], isLoading: loadingClients } = useClients();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [portalPassword, setPortalPassword] = useState("");
    const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
    const [menuOpenClientId, setMenuOpenClientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/clients", newClient);
            setIsModalOpen(false);
            setNewClient({ name: "", email: "", phone: "" });
            toast.success("Client added successfully");
            invalidateAll();
        } catch (err) {
            console.error("Failed to create client", err);
            toast.error("Failed to create client");
        }
    };

    const handleEnablePortal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch(`/clients/${selectedClient.id}/enable-portal`, { password: portalPassword });
            setIsPortalModalOpen(false);
            setPortalPassword("");
            toast.success("Portal access enabled");
            invalidateAll();
        } catch (err) {
            console.error("Failed to enable portal", err);
            toast.error("Failed to enable portal");
        }
    };

    const handleDisablePortal = async (client: any) => {
        if (!confirm(`Are you sure you want to deactivate portal access for ${client.name}?`)) return;
        try {
            await api.patch(`/clients/${client.id}/disable-portal`);
            toast.success("Portal access deactivated");
            setMenuOpenClientId(null);
            invalidateAll();
        } catch (err: any) {
            console.error("Failed to disable portal", err);
            toast.error("Failed to deactivate portal");
        }
    };

    if (loadingClients) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-black text-sm"
                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:brightness-110"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                    <Plus size={18} />
                    Add Client
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-10">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clients
                            .filter((client: any) =>
                                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
                            )
                            .map((client: any) => (
                                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
                                                {client.name[0]}
                                            </div>
                                            <span className="font-semibold text-slate-900 text-black">{client.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail size={14} />
                                                {client.email}
                                            </div>
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <Phone size={14} />
                                                    {client.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {client.userId ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                                                <CheckCircle2 size={12} />
                                                Portal Active
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setIsPortalModalOpen(true);
                                                }}
                                                className="flex items-center gap-1.5 font-bold text-[10px] uppercase hover:opacity-80 transition-opacity"
                                                style={{ color: 'var(--brand-primary)' }}
                                            >
                                                <Key size={12} />
                                                Enable Portal
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setMenuOpenClientId(menuOpenClientId === client.id ? null : client.id)}
                                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {menuOpenClientId === client.id && (
                                            <div className="absolute right-6 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-10 text-left">
                                                {client.userId ? (
                                                    <button
                                                        onClick={() => handleDisablePortal(client)}
                                                        className="w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                                                    >
                                                        <ShieldOff size={16} />
                                                        Deactivate Portal
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClient(client);
                                                            setIsPortalModalOpen(true);
                                                            setMenuOpenClientId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                                    >
                                                        <Key size={16} />
                                                        Enable Portal
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No clients found. Click "Add Client" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Client Portal Activation Modal */}
            {isPortalModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Enable Portal</h3>
                        <p className="text-slate-500 mb-6 text-sm">
                            Set a temporary password for <strong>{selectedClient?.name}</strong>. They will use their email to log in.
                        </p>

                        <form onSubmit={handleEnablePortal} className="space-y-4 text-black">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    value={portalPassword}
                                    onChange={(e) => setPortalPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsPortalModalOpen(false)}
                                    className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 text-white font-semibold rounded-lg transition-all font-bold hover:brightness-110 shadow-lg shadow-black/5"
                                    style={{ backgroundColor: 'var(--brand-primary)' }}
                                >
                                    Activate Access
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Basic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">New Client</h3>
                        <p className="text-slate-500 mb-6">Enter the client information to add them to your portal.</p>

                        <form onSubmit={handleCreateClient} className="space-y-4 text-black">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                                <input
                                    type="text"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 text-white font-semibold rounded-lg transition-all hover:brightness-110 shadow-lg shadow-black/5"
                                    style={{ backgroundColor: 'var(--brand-primary)' }}
                                >
                                    Add Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

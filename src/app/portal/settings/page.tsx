"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function ClientSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.patch("/auth/change-password", {
                currentPassword,
                newPassword
            });
            toast.success("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                        <Lock size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Security Settings</h1>
                        <p className="text-slate-500">Manage your password and account security.</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md text-black">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 hover:brightness-110 shadow-lg"
                            style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 8px 20px -6px var(--brand-soft)' }}
                        >
                            {isChangingPassword ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Lock size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Security Tip</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Use a strong, unique password to protect your project data and invoices. We recommend using a mix of letters, numbers, and symbols.
                    </p>
                </div>
            </div>
        </div>
    );
}

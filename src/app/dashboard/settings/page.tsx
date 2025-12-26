"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Camera, Check, Lock } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [brandColor, setBrandColor] = useState("#4f46e5");
    const [currency, setCurrency] = useState("USD");
    const [address, setAddress] = useState("");
    const [taxId, setTaxId] = useState("");

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await api.get("/business/profile");
                setBusiness(res.data);
                setName(res.data.name);
                setLogoUrl(res.data.logo || "");
                setBrandColor(res.data.brandColor || "#4f46e5");
                setCurrency(res.data.currency || "USD");
                setAddress(res.data.address || "");
                setTaxId(res.data.taxId || "");
            } catch (err) {
                console.error("Failed to fetch business profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch("/business/profile", {
                name,
                logo: logoUrl,
                brandColor,
                currency,
                address,
                taxId,
            });
            toast.success("Business profile updated");
            // Reload page to apply brand color changes globally if needed
            // window.location.reload();
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const res = await api.post("/upload/branding", formData);
            setLogoUrl(res.data.url);
            toast.success("Logo uploaded temporarily. Save changes to finalize.");
        } catch (err) {
            toast.error("Failed to upload logo");
        }
    };

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

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--brand-primary)' }} /></div>;

    return (
        <div className="max-w-4xl space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-slate-700">Business Logo</label>
                        <div className="relative group w-32 h-32 mx-auto">
                            <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <Camera className="text-slate-300" size={40} />
                                )}
                            </div>
                            <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                                <Camera size={20} />
                                <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                            </label>
                        </div>
                        <p className="text-[11px] text-slate-400 text-center italic">Supported: JPG, PNG. Max 2MB.</p>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        className="w-10 h-10 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-sm font-mono"
                                        style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
                                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD ($)</option>
                                    <option value="AUD">AUD ($)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / VAT Number</label>
                                <input
                                    type="text"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                            <textarea
                                rows={2}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Your official business address..."
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 text-white font-bold rounded-lg transition-all disabled:opacity-50 hover:brightness-110 shadow-lg"
                                style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 4px 6px -1px var(--brand-soft)' }}
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Account Security Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Account Security</h2>
                        <p className="text-sm text-slate-500">Update your login credentials here.</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-black">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="flex items-center gap-2 px-6 py-2.5 text-white font-bold rounded-lg transition-all disabled:opacity-50 hover:brightness-110 shadow-lg"
                        style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 4px 6px -1px var(--brand-soft)' }}
                    >
                        {isChangingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
}

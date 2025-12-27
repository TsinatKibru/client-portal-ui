"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { LayoutDashboard, FileText, LucideBriefcase, LogOut, Settings } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            router.push("/login");
            return;
        }
        const userData = JSON.parse(userStr);
        if (userData.role !== "CLIENT") {
            router.push("/dashboard");
            return;
        }
        setUser(userData);

        const fetchBusiness = async () => {
            try {
                const res = await api.get("/business/profile");
                setBusiness(res.data);
            } catch (err) {
                console.error("Failed to fetch branding", err);
            }
        };
        fetchBusiness();

    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3">
                    {business?.logo ? (
                        <img src={business.logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--brand-primary)' }}>
                            {business?.name?.[0] || 'P'}
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <h2 className="text-sm font-bold tracking-tight text-white truncate">{business?.name || 'Portal'}</h2>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Client Access</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    <Link
                        href="/portal"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${pathname === "/portal" ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                        style={pathname === '/portal' ? { backgroundColor: 'var(--brand-primary)' } : {}}
                    >
                        <LayoutDashboard size={18} />
                        Overview
                    </Link>
                    <Link
                        href="/portal/projects"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${pathname.startsWith("/portal/projects") ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                        style={pathname.startsWith('/portal/projects') ? { backgroundColor: 'var(--brand-primary)' } : {}}
                    >
                        <LucideBriefcase size={18} />
                        My Projects
                    </Link>
                    <Link
                        href="/portal/invoices"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${pathname.startsWith("/portal/invoices") ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                        style={pathname.startsWith('/portal/invoices') ? { backgroundColor: 'var(--brand-primary)' } : {}}
                    >
                        <FileText size={18} />
                        Invoices
                    </Link>
                    <div className="pt-4 mt-4 border-t border-slate-800/50">
                        <Link
                            href="/portal/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${pathname === "/portal/settings" ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                            style={pathname === "/portal/settings" ? { backgroundColor: 'var(--brand-primary)' } : {}}
                        >
                            <Settings size={18} />
                            Settings
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all font-medium text-sm"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-lg font-bold text-slate-900 text-black">Welcome Back</h1>
                    <div className="flex items-center gap-4">
                        {business && user && (
                            <NotificationBell
                                businessId={business.id}
                                userId={user.id}
                            />
                        )}
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900 text-black">{user.email}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Client Account</p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
                            {user.email[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

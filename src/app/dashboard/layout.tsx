"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { LayoutDashboard, Users, FolderKanban, FileText, Settings, LogOut, Files } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
        } else {
            setUser(JSON.parse(storedUser));
        }

        const fetchBusiness = async () => {
            try {
                const res = await api.get("/business/profile");
                setBusiness(res.data);
            } catch (err) {
                console.error("Failed to fetch business branding", err);
            }
        };
        fetchBusiness();
    }, [router]);


    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    if (!user) return null;

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Clients", href: "/dashboard/clients", icon: Users },
        { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
        { name: "Shared Files", href: "/dashboard/files", icon: Files },
        { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        {business?.logo ? (
                            <img src={business.logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                <span className="text-white font-bold">{business?.name?.[0] || 'CP'}</span>
                            </div>
                        )}
                        <span className="font-bold text-xl text-slate-900 text-black truncate">{business?.name || 'ClientPortal'}</span>
                    </div>


                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    style={isActive ? { backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' } : { color: '#475569' }}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-xs text-black">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate text-black">{user.email}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-800 text-black">
                        {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-4">
                        {business && user && (
                            <NotificationBell
                                businessId={business.id}
                                userId={user.id}
                            />
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

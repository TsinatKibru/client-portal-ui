"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.access_token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            if (res.data.user.role === 'CLIENT') {
                router.push("/portal");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
            {/* Subtle Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-200/50 blur-[120px]"></div>

            <div className="relative w-full max-w-md px-6">
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/60 p-10">
                    {/* Brand/Logo Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center mb-6">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                                <span className="text-white font-black text-lg italic">CP</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 font-medium">Sign in to your client portal</p>
                    </div>

                    {error && (
                        <div className="p-4 mb-8 text-sm text-rose-600 bg-rose-50/50 backdrop-blur-md rounded-2xl border border-rose-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/40 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all text-black font-medium"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/40 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all text-black font-medium"
                                    style={{ '--tw-ring-color': 'var(--brand-primary)', '--tw-border-color': 'var(--brand-primary)' } as any}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 text-white font-black rounded-2xl transition-all active:scale-[0.98] hover:brightness-110 shadow-2xl flex items-center justify-center gap-2 relative overflow-hidden group"
                            style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 20px 30px -10px var(--brand-soft)' }}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-slate-500 font-medium text-sm">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-slate-900 font-black hover:opacity-70 transition-opacity underline decoration-2 decoration-indigo-500/20 underline-offset-4">
                            Start Business
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

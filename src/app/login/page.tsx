"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
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
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Welcome Back</h1>
                <p className="text-center text-slate-500 mb-8">Sign in to your client portal</p>

                {error && <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 transition-all text-black"
                            style={{ '--tw-ring-color': 'var(--brand-primary)' } as any}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-all active:scale-[0.98] hover:brightness-110 shadow-lg"
                        style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 15px -3px var(--brand-soft)' }}
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--brand-primary)' }}>
                        Create Business
                    </Link>
                </p>
            </div>
        </div>
    );
}

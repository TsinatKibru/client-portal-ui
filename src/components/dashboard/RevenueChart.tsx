"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
    data: { name: string; revenue: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[350px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-900">Revenue Growth</h3>
                    <p className="text-xs text-slate-400">Last 12 months performance</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
                    <span className="text-xs font-semibold text-slate-600">Revenue</span>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontWeight: 'bold'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--brand-primary)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: 'var(--brand-primary)', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

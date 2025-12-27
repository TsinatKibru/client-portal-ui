"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProjectStatusChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#94a3b8', '#4F46E5', '#10b981'];

export default function ProjectStatusChart({ data }: ProjectStatusChartProps) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[350px]">
            <h3 className="font-bold text-slate-900 mb-6">Job Distribution</h3>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontWeight: 'bold'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

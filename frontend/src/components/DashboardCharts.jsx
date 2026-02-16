
import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, Legend,
    AreaChart, Area
} from 'recharts';
import Card from '../common/Card';
import { ChartIcon, TargetIcon, InvestmentIcon, TrendingUpIcon } from '../common/Icons';
import axios from 'axios';
import { getCurrentUser } from '../api/auth';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


export const DashboardCharts = () => {
    const [historyData, setHistoryData] = useState([]);
    const [allocationData, setAllocationData] = useState([]);
    const [summaryData, setSummaryData] = useState({ invested: 0, current: 0 });
    const [goalsProgressData, setGoalsProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error("No authentication token found. Please login again.");
                }
                const headers = { Authorization: `Bearer ${token}` };
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

                const [historyRes, allocationRes, summaryRes, goalsRes] = await Promise.all([
                    axios.get(`${apiUrl}/dashboard/history?period=1M`, { headers }),
                    axios.get(`${apiUrl}/dashboard/allocation`, { headers }),
                    axios.get(`${apiUrl}/dashboard/summary`, { headers }),
                    axios.get(`${apiUrl}/dashboard/goals-progress`, { headers })
                ]);

                setHistoryData(historyRes.data);
                setAllocationData(allocationRes.data);
                setSummaryData(summaryRes.data);
                setGoalsProgressData(goalsRes.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="animate-pulse h-64 bg-gray-200 rounded-lg mb-8"></div>;
    }

    // Format currency
    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    return (
        <div className="space-y-8 mb-8">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Row 1: Portfolio Growth & Asset Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Portfolio Growth Over Time */}
                <Card className="h-96 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-800">Portfolio Growth</h3>
                        </div>
                        <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option>1 Month</option>
                            {/* Add more options later if needed */}
                        </select>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), 'Value']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total_value"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Asset Allocation Breakdown */}
                <Card className="h-96 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <ChartIcon className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-800">Asset Allocation</h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        {allocationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                No assets found
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Row 2: Invested vs Current & Goal Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Invested vs Current Value */}
                <Card className="h-80 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <InvestmentIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Performance Summary</h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Invested', amount: summaryData.invested, fill: '#94a3b8' },
                                    { name: 'Current', amount: summaryData.current, fill: summaryData.current >= summaryData.invested ? '#10b981' : '#ef4444' }
                                ]}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#4b5563', fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40}>
                                    {
                                        [
                                            { name: 'Invested', amount: summaryData.invested, fill: '#94a3b8' },
                                            { name: 'Current', amount: summaryData.current, fill: summaryData.current >= summaryData.invested ? '#10b981' : '#ef4444' }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Goal Progress Tracking */}
                <Card className="h-80 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <TargetIcon className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-gray-800">Goal Progress</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {goalsProgressData.length > 0 ? (
                            goalsProgressData.map((goal) => (
                                <div key={goal.id}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${goal.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p>No active goals linked to investments.</p>
                                <p className="text-xs mt-2">Link investments to goals to see progress.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

        </div>
    );
};

export default DashboardCharts;

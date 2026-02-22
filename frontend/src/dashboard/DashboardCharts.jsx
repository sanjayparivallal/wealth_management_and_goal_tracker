
import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, Legend,
    AreaChart, Area
} from 'recharts';
import Card from '../common/Card';
import { ChartIcon, TargetIcon, InvestmentIcon, TrendingUpIcon } from '../common/Icons';
// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// ─── Reusable Empty State Component ───────────────────────────────
const EmptyState = ({ icon: Icon, iconColor, bgColor, title, description }) => (
    <div className="flex flex-col items-center justify-center h-[280px] rounded-xl"
        style={{ background: bgColor || 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
    >
        <div className="relative mb-4">
            {/* Decorative rings */}
            <div className="absolute inset-0 -m-3 rounded-full opacity-10" style={{ border: `2px dashed ${iconColor}` }} />
            <div className="absolute inset-0 -m-6 rounded-full opacity-5" style={{ border: `2px dashed ${iconColor}` }} />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${iconColor}15` }}
            >
                <Icon className="w-7 h-7" style={{ color: iconColor }} />
            </div>
        </div>
        <p className="font-semibold text-gray-600 text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-1.5 max-w-[200px] text-center leading-relaxed">{description}</p>
    </div>
);


export const DashboardCharts = ({ aggregateData }) => {
    const allHistoryData = aggregateData?.history || [];
    const allocationData = aggregateData?.allocation || [];
    const summaryData = aggregateData?.dashboard_summary || { invested: 0, current: 0 };
    const goalsProgressData = aggregateData?.goals_progress || [];

    const loading = !aggregateData;
    const error = null;

    const [selectedPeriod, setSelectedPeriod] = useState('1M');
    const [summaryPeriod, setSummaryPeriod] = useState('ALL');

    // Client-side filter: slice history data based on selectedPeriod
    const historyData = React.useMemo(() => {
        if (!allHistoryData.length) return [];
        const now = new Date();
        const periodDays = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': Infinity };
        const days = periodDays[selectedPeriod] || 30;
        if (days === Infinity) return allHistoryData;

        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return allHistoryData.filter(d => new Date(d.date) >= cutoff);
    }, [allHistoryData, selectedPeriod]);

    // Performance Summary: compute invested vs current filtered by summaryPeriod
    const filteredSummary = React.useMemo(() => {
        // If ALL or no history data, use the raw summary from the API
        if (summaryPeriod === 'ALL' || !allHistoryData.length) {
            return { invested: summaryData.invested, current: summaryData.current };
        }
        const now = new Date();
        const periodDays = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
        const days = periodDays[summaryPeriod] || 30;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const filtered = allHistoryData.filter(d => new Date(d.date) >= cutoff);
        if (!filtered.length) return { invested: summaryData.invested, current: summaryData.current };
        const startPoint = filtered[0];
        const endPoint = filtered[filtered.length - 1];
        // Invested in this period = new money added during the period
        const investedInPeriod = (endPoint.total_invested || 0) - (startPoint.total_invested || 0);
        // Current value change over the period
        const currentValueChange = (endPoint.total_value || 0) - (startPoint.total_value || 0);
        return {
            invested: Math.max(investedInPeriod, 0),
            current: currentValueChange
        };
    }, [allHistoryData, summaryPeriod, summaryData]);

    if (loading) {
        return <div className="animate-pulse h-64 bg-gray-200 rounded-lg mb-8"></div>;
    }

    // Format currency
    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    // Check if performance data is empty
    const hasPerformanceData = summaryData.invested > 0 || summaryData.current > 0;

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
                <Card className="border-l-4 border-l-indigo-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-800">Portfolio Growth</h3>
                        </div>
                        <select
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="1M">1 Month</option>
                            <option value="3M">3 Months</option>
                            <option value="6M">6 Months</option>
                            <option value="1Y">1 Year</option>
                            <option value="ALL">All Time</option>
                        </select>
                    </div>
                    <div className="w-full">
                        {historyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
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
                        ) : (
                            <EmptyState
                                icon={TrendingUpIcon}
                                iconColor="#6366f1"
                                bgColor="linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
                                title="No portfolio history yet"
                                description="Add investments and track their growth over time here."
                            />
                        )}
                    </div>
                </Card>

                {/* Asset Allocation Breakdown */}
                <Card className="border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-2 mb-4">
                        <ChartIcon className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-800">Asset Allocation</h3>
                    </div>
                    <div className="w-full h-[300px]">
                        {allocationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
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
                            <EmptyState
                                icon={ChartIcon}
                                iconColor="#10b981"
                                bgColor="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                                title="No assets to display"
                                description="Your allocation breakdown will appear here once you add investments."
                            />
                        )}
                    </div>
                </Card>
            </div>

            {/* Row 2: Performance Summary & Goal Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Performance Summary with Period Filter */}
                <Card className="border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <InvestmentIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-800">Performance Summary</h3>
                        </div>
                        {/* Period filter pills */}
                        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                            {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSummaryPeriod(period)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${summaryPeriod === period
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {period === 'ALL' ? 'All' : period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full">
                        {filteredSummary.invested === 0 && filteredSummary.current === 0 ? (
                            <EmptyState
                                icon={InvestmentIcon}
                                iconColor="#3b82f6"
                                bgColor="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                                title="No investments yet"
                                description="Start investing to compare your cost basis versus current market value."
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={[
                                        { name: 'Invested', amount: filteredSummary.invested, fill: '#94a3b8' },
                                        { name: 'Current', amount: filteredSummary.current, fill: filteredSummary.current >= filteredSummary.invested ? '#10b981' : '#ef4444' }
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
                                                { fill: '#94a3b8' },
                                                { fill: filteredSummary.current >= filteredSummary.invested ? '#10b981' : '#ef4444' }
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Summary stats footer */}
                    {(filteredSummary.invested > 0 || filteredSummary.current > 0) && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                <span className="font-medium text-gray-700">Invested:</span> {formatCurrency(filteredSummary.invested)}
                            </div>
                            <div className="text-xs text-gray-500">
                                <span className="font-medium text-gray-700">Current:</span>{' '}
                                <span className={filteredSummary.current >= filteredSummary.invested ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                                    {formatCurrency(filteredSummary.current)}
                                </span>
                            </div>
                            <div className="text-xs">
                                <span className={`font-bold px-1.5 py-0.5 rounded ${filteredSummary.current >= filteredSummary.invested
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : 'text-red-700 bg-red-50'
                                    }`}>
                                    {filteredSummary.invested > 0
                                        ? `${((filteredSummary.current - filteredSummary.invested) / filteredSummary.invested * 100).toFixed(1)}%`
                                        : '0%'}
                                </span>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Goal Progress Tracking */}
                <Card className="overflow-hidden border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TargetIcon className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold text-gray-800">Goal Progress</h3>
                        </div>
                        {goalsProgressData.length > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {goalsProgressData.length} active
                            </span>
                        )}
                    </div>
                    {goalsProgressData.length > 0 ? (
                        <div className="space-y-3">
                            {goalsProgressData.map((goal) => {
                                const goalConfig = {
                                    'Retirement': { emoji: '🏖️', bg: 'bg-blue-50', border: 'border-blue-200' },
                                    'Home': { emoji: '🏠', bg: 'bg-green-50', border: 'border-green-200' },
                                    'Education': { emoji: '🎓', bg: 'bg-purple-50', border: 'border-purple-200' },
                                    'Custom': { emoji: '🎯', bg: 'bg-orange-50', border: 'border-orange-200' }
                                }[goal.name] || { emoji: '🎯', bg: 'bg-gray-50', border: 'border-gray-200' };
                                const progressColor = goal.percent >= 75 ? '#10b981' : goal.percent >= 40 ? '#eab308' : '#f97316';
                                return (
                                    <div key={goal.id} className="group">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className={`w-9 h-9 flex items-center justify-center rounded-lg ${goalConfig.bg} border ${goalConfig.border} text-base flex-shrink-0`}>
                                                {goalConfig.emoji}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-800">{goal.name}</span>
                                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: progressColor, backgroundColor: `${progressColor}15` }}>
                                                        {goal.percent.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-12">
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
                                                <div className="h-2.5 rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${Math.max(goal.percent, 2)}%`, backgroundColor: progressColor }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{formatCurrency(goal.current)} of {formatCurrency(goal.target)}</span>
                                                <span>
                                                    {goal.monthly_contribution > 0 && `${formatCurrency(goal.monthly_contribution)}/mo`}
                                                    {goal.months_remaining > 0 && ` · ${goal.months_remaining}mo`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            icon={TargetIcon}
                            iconColor="#f97316"
                            bgColor="linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)"
                            title="No active goals yet"
                            description="Create financial goals to visualize and track your progress here."
                        />
                    )}
                </Card>
            </div>

        </div>
    );
};

export default DashboardCharts;

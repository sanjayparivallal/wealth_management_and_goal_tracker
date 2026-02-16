import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../api/recommendations';
import Navbar from '../common/Navbar';
import Card from '../common/Card';
import { RecommendationsSkeleton } from '../common/Skeleton';
import {
    ChartIcon,
    TrendingUpIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    InvestmentIcon,
    PieChartIcon,
    TargetIcon
} from '../common/Icons';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';


const PIE_COLORS = {
    equity: '#6366f1',
    debt: '#10b981',
    cash: '#f59e0b'
};

const CATEGORY_LABELS = {
    equity: 'Equity',
    debt: 'Debt / Bonds',
    cash: 'Cash'
};

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

const RecommendationsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getRecommendations();
                setData(result);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError(err.response?.data?.detail || 'Failed to load recommendations');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <RecommendationsSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                        <strong>Error:</strong> {error}
                    </div>
                </main>
            </div>
        );
    }

    // Prepare pie chart data
    const targetPieData = Object.entries(data.target_allocation).map(([key, value]) => ({
        name: CATEGORY_LABELS[key] || key,
        value,
        fill: PIE_COLORS[key] || '#94a3b8'
    }));

    const currentPieData = Object.entries(data.current_allocation).map(([key, value]) => ({
        name: CATEGORY_LABELS[key] || key,
        value: Math.round(value * 100) / 100,
        fill: PIE_COLORS[key] || '#94a3b8'
    }));

    const hasInvestments = data.total_portfolio_value > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Header */}
                <Card className="mb-6 border-l-4 border-l-indigo-400">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                                <PieChartIcon className="w-7 h-7 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Personalized Recommendations</h2>
                                <p className="text-gray-500 text-sm">Allocation suggestions tailored to your profile</p>
                            </div>
                        </div>
                        {hasInvestments && (
                            <div className="hidden md:block text-right">
                                <p className="text-sm text-gray-500">Total Portfolio</p>
                                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(data.total_portfolio_value)}</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Allocation Comparison — Two Pie Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* Recommended Allocation */}
                    <Card className="border-l-4 border-l-indigo-500">
                        <div className="flex items-center gap-2 mb-4">
                            <TargetIcon className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-800">Recommended Allocation</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={targetPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={2}
                                    stroke="#fff"
                                >
                                    {targetPieData.map((entry, index) => (
                                        <Cell key={`target-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 space-y-2">
                            {targetPieData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Current Allocation */}
                    <Card className="border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-2 mb-4">
                            <ChartIcon className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-semibold text-gray-800">Current Allocation</h3>
                        </div>
                        {hasInvestments ? (
                            <>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={currentPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={95}
                                            paddingAngle={4}
                                            dataKey="value"
                                            strokeWidth={2}
                                            stroke="#fff"
                                        >
                                            {currentPieData.map((entry, index) => (
                                                <Cell key={`current-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-2 space-y-2">
                                    {currentPieData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                                                <span className="text-gray-600">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-800">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                                <InvestmentIcon className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="font-medium">No investments yet</p>
                                <p className="text-xs mt-1">Add investments to see your current allocation.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Rebalancing Suggestions */}
                <Card className="border-l-4 border-l-amber-500">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUpIcon className="w-5 h-5 text-amber-600" />
                        <h3 className="font-semibold text-gray-800">Rebalancing Suggestions</h3>
                    </div>

                    {data.suggestions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.suggestions.map((suggestion, index) => {
                                const isIncrease = suggestion.action === 'Increase' || suggestion.action === 'Invest';
                                const cardColor = isIncrease
                                    ? { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' }
                                    : { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', badge: 'bg-red-100 text-red-700' };

                                return (
                                    <div key={index} className={`p-4 rounded-xl border ${cardColor.border} ${cardColor.bg} transition-all hover:shadow-md`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${isIncrease ? 'bg-green-100' : 'bg-red-100'} flex-shrink-0`}>
                                                {isIncrease ? (
                                                    <ArrowUpIcon className={`w-5 h-5 ${cardColor.icon}`} />
                                                ) : (
                                                    <ArrowDownIcon className={`w-5 h-5 ${cardColor.icon}`} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cardColor.badge}`}>
                                                        {suggestion.action}
                                                    </span>
                                                    <span className="text-xs text-gray-500 capitalize">{suggestion.category}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 mb-1">
                                                    {suggestion.message}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {suggestion.reasoning}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-green-50 text-2xl mb-3">✅</div>
                            <p className="font-medium text-green-600">Your portfolio is well-balanced!</p>
                            <p className="text-xs mt-1 text-gray-500">No rebalancing needed — allocations are within target range.</p>
                        </div>
                    )}
                </Card>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 text-center mt-6">
                    These recommendations are advisory only. No automatic portfolio changes will be made.
                </p>

            </main>
        </div>
    );
};

export default RecommendationsPage;

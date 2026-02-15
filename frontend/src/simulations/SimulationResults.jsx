import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { RiskIcon, TrendingUpIcon } from '../common/Icons';

const SimulationResults = ({ simulation }) => {
    // If simulation.results is already an object (which it is from the API), use it directly.
    // If it's a string (e.g. from local storage or older API), parse it.
    const results = typeof simulation.results === 'string' ? JSON.parse(simulation.results) : simulation.results;
    const assumptions = typeof simulation.assumptions === 'string' ? JSON.parse(simulation.assumptions) : simulation.assumptions;

    // Format data for chart
    // We only show one point per year to keep chart clean
    const chartData = results.chart_data.filter(point => point.month % 12 === 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{simulation.scenario_name}</h2>
                        <div className="flex gap-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">Time: {assumptions.time_horizon_years} Years</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">Return: {assumptions.expected_return_rate}%</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">Inflation: {assumptions.inflation_rate}%</span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Total Invested</p>
                        <p className="text-xl font-semibold text-gray-900">
                            {formatCurrency(results.summary.total_invested)}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-sm text-green-700 mb-1">Future Value (Nominal)</p>
                        <p className="text-xl font-bold text-green-700">
                            {formatCurrency(results.summary.future_value_nominal)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            +{formatCurrency(results.summary.nominal_gain)} gain
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-700 mb-1">Real Value (Inflation Adj.)</p>
                        <p className="text-xl font-bold text-blue-700">
                            {formatCurrency(results.summary.future_value_real)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Purchasing power today
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                            <XAxis
                                dataKey="year"
                                stroke="#64748b"
                                label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }}
                            />
                            <YAxis
                                stroke="#64748b"
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1f2937' }}
                                itemStyle={{ color: '#1f2937' }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="nominal_value"
                                name="Nominal Value"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorNominal)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="real_value"
                                name="Real Value (Inflation Adj.)"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorReal)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="p-1 bg-yellow-100 rounded-full">
                        <RiskIcon className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">Inflation Impact</h4>
                        <p className="text-sm text-yellow-700">
                            Due to {assumptions.inflation_rate}% inflation, your projected
                            <span className="font-semibold text-yellow-900"> {formatCurrency(results.summary.future_value_nominal)} </span>
                            will only have the purchasing power of
                            <span className="font-semibold text-yellow-900"> {formatCurrency(results.summary.future_value_real)} </span>
                            in today's money.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationResults;

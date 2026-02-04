import Card from "../common/Card";
import { MoneyIcon, TrendingUpIcon, TrendingDownIcon, ChartIcon, EditIcon } from "../common/Icons";
import { TableContentSkeleton, CardSkeleton } from "../common/Skeleton";


export default function InvestmentsTable({ investments, summary, onEdit, loading }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount || 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return (
            <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                    {date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs text-gray-500">
                    {date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        );
    };

    const getGainLossColor = (costBasis, currentValue) => {
        const gain = currentValue - costBasis;
        return gain >= 0 ? "text-green-600" : "text-red-600";
    };

    const getAssetTypeStyle = (type) => {
        switch (type?.toLowerCase()) {
            case "stock": return { border: "border-blue-400", text: "text-blue-700", dot: "bg-blue-500", ping: "bg-blue-400" };
            case "crypto": return { border: "border-purple-400", text: "text-purple-700", dot: "bg-purple-500", ping: "bg-purple-400" };
            case "etf": return { border: "border-indigo-400", text: "text-indigo-700", dot: "bg-indigo-500", ping: "bg-indigo-400" };
            case "bond": return { border: "border-yellow-400", text: "text-yellow-700", dot: "bg-yellow-500", ping: "bg-yellow-400" };
            case "mutual_fund": return { border: "border-pink-400", text: "text-pink-700", dot: "bg-pink-500", ping: "bg-pink-400" };
            default: return { border: "border-gray-400", text: "text-gray-700", dot: "bg-gray-500", ping: "bg-gray-400" };
        }
    };

    if (loading) {
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {[...Array(3)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
                <TableContentSkeleton rows={5} columns={7} />
            </>
        );
    }

    return (
        <>
            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Investment</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(summary.total_cost_basis)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <MoneyIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Current Value</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(summary.total_current_value)}
                                </p>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-full">
                                <ChartIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Gain/Loss</h3>
                                <p className={`text-2xl font-bold mt-2 ${summary.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(summary.total_gain_loss)}
                                    <span className="text-sm ml-2">
                                        ({summary.total_gain_loss_percentage?.toFixed(2)}%)
                                    </span>
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${summary.total_gain_loss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                {summary.total_gain_loss >= 0 
                                    ? <TrendingUpIcon className="w-6 h-6 text-green-600" />
                                    : <TrendingDownIcon className="w-6 h-6 text-red-600" />
                                }
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Investments Table */}
            {investments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center text-gray-600">
                        No investments yet. Add your first investment!
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-600">
                                <tr className="divide-x divide-indigo-500">
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Asset Type</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Units</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Avg Buy Price</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Last Price</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Basis</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Current Value</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Gain/Loss</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {investments.map((investment, index) => {
                                    const gainLoss = investment.current_value - investment.cost_basis;
                                    const gainLossPercent = (gainLoss / investment.cost_basis) * 100;

                                    return (
                                        <tr key={investment.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50 transition-all duration-200 divide-x divide-gray-100`}>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900">{investment.symbol}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {(() => {
                                                    const style = getAssetTypeStyle(investment.asset_type);
                                                    return (
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${style.border} ${style.text}`}>
                                                            <span className="relative flex h-2 w-2">
                                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.ping}`}></span>
                                                                <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
                                                            </span>
                                                            <span className="text-xs font-bold uppercase tracking-wide capitalize">
                                                                {investment.asset_type?.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{investment.units}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{formatCurrency(investment.avg_buy_price)}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{formatCurrency(investment.last_price)}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {formatDateTime(investment.last_price_at)}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 font-semibold">{formatCurrency(investment.cost_basis)}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 font-semibold">{formatCurrency(investment.current_value)}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className={`inline-flex flex-col px-3 py-1 rounded-lg ${gainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    <span className={`text-sm font-bold ${gainLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        {formatCurrency(gainLoss)}
                                                    </span>
                                                    <span className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        ({gainLossPercent.toFixed(2)}%)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex justify-center items-center">
                                                    <button
                                                        onClick={() => onEdit(investment)}
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 font-semibold transition-colors duration-200"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}

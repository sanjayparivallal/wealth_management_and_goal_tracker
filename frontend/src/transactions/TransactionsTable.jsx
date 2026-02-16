import {
    ChartIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    MoneyIcon,
    TransactionIcon
} from "../common/Icons";
import Card from "../common/Card";
import { TableContentSkeleton, CardSkeleton } from "../common/Skeleton";

export default function TransactionsTable({ transactions, summary, loading }) {
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

    const getTypeIcon = (type) => {
        const iconClass = "w-4 h-4";
        switch (type) {
            case "buy":
                return <TrendingUpIcon className={iconClass} />;
            case "sell":
                return <TrendingDownIcon className={iconClass} />;
            case "dividend":
                return <MoneyIcon className={iconClass} />;
            default:
                return <TransactionIcon className={iconClass} />;
        }
    };

    if (loading) {
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
                <TableContentSkeleton rows={5} columns={6} />
            </>
        );
    }

    return (
        <>


            {/* Transactions Table */}
            {transactions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center text-gray-600">
                        <TransactionIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No transactions yet. Record your first transaction!</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
                                <tr className="divide-x divide-indigo-500/30">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Fees</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Executed At</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {transactions.map((transaction, index) => {
                                    const quantity = parseFloat(transaction.quantity) || 0;
                                    const price = parseFloat(transaction.price) || 0;
                                    const fees = parseFloat(transaction.fees) || 0;
                                    const total = (quantity * price) + fees;

                                    return (
                                        <tr key={transaction.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50 transition-all duration-200 divide-x divide-gray-100`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-indigo-100 rounded">
                                                        <ChartIcon className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{transaction.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${transaction.type === 'buy'
                                                        ? 'border-green-400 text-green-700 hover:shadow-green-200'
                                                        : transaction.type === 'sell'
                                                            ? 'border-red-400 text-red-700 hover:shadow-red-200'
                                                            : 'border-purple-400 text-purple-700 hover:shadow-purple-200'
                                                    }`}>
                                                    <span className={`p-1 rounded ${transaction.type === 'buy' ? 'bg-green-100'
                                                            : transaction.type === 'sell' ? 'bg-red-100'
                                                                : 'bg-purple-100'
                                                        }`}>
                                                        {getTypeIcon(transaction.type)}
                                                    </span>
                                                    <span className="text-xs font-bold uppercase tracking-wide">{transaction.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">{transaction.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">{formatCurrency(transaction.price)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-500">{formatCurrency(transaction.fees)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatDateTime(transaction.executed_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900 bg-green-50 px-3 py-1 rounded-lg">{formatCurrency(total)}</span>
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

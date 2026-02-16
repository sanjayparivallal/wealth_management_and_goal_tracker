
import Card from "../common/Card";
import { MoneyIcon, TrendingUpIcon, TrendingDownIcon, ChartIcon } from "../common/Icons";

export default function InvestmentSummaryCards({ summary }) {
    if (!summary) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount || 0);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
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
            <Card className="border-l-4 border-l-indigo-500">
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
            <Card className={`border-l-4 ${summary.total_gain_loss >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
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
    );
}

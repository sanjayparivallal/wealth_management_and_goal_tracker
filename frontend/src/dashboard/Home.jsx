import { getCurrentUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import Card from "../common/Card";
import { DashboardIcon, RiskIcon, TargetIcon, CheckIcon, MoneyIcon, InvestmentIcon, TrendingUpIcon, TransactionIcon, ChartIcon, CalendarIcon, RefreshIcon } from "../common/Icons";
import { DashboardContentSkeleton } from "../common/Skeleton";
import DashboardCharts from "./DashboardCharts";
import { getDashboardAggregate } from "../api/api";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [investmentSummary, setInvestmentSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [aggregateData, setAggregateData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [userData, aggregateRawData] = await Promise.all([
          getCurrentUser(),
          getDashboardAggregate()
        ]);
        if (!mounted) return;
        setUser(userData);
        setAggregateData(aggregateRawData);
        setGoals(aggregateRawData.goals || []);
        setInvestments(aggregateRawData.investments || []);
        setInvestmentSummary(aggregateRawData.investment_summary || null);
        setTransactions(aggregateRawData.transactions || []);
        setTransactionSummary(aggregateRawData.transaction_summary || null);
      } catch (err) {
        if (!mounted) return;   // user already navigated away — do nothing
        toast.error("Failed to fetch data");
        navigate("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };  // cleanup on unmount / page change
  }, [navigate]);

  // Calculate Goals Stats
  const goalStats = {
    totalGoals: goals.length,
    activeGoals: goals.filter(g => g.status === "active").length,
    completedGoals: goals.filter(g => g.status === "completed").length,
    totalTargetAmount: goals.reduce((sum, g) => sum + (parseFloat(g.target_amount) || 0), 0),
    totalMonthlyContribution: goals.filter(g => g.status === "active").reduce((sum, g) => sum + (parseFloat(g.monthly_contribution) || 0), 0)
  };

  // Calculate Investment Stats
  const investmentStats = {
    totalInvestments: investments.length,
    totalValue: investments.reduce((sum, i) => sum + (parseFloat(i.current_value) || 0), 0),
    totalCost: investments.reduce((sum, i) => sum + (parseFloat(i.cost_basis) || 0), 0),
    totalGainLoss: investments.reduce((sum, i) => sum + ((parseFloat(i.current_value) || 0) - (parseFloat(i.cost_basis) || 0)), 0),
    gainLossPercent: (() => {
      const totalCost = investments.reduce((sum, i) => sum + (parseFloat(i.cost_basis) || 0), 0);
      const totalValue = investments.reduce((sum, i) => sum + (parseFloat(i.current_value) || 0), 0);
      return totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    })()
  };

  // Calculate Transaction Stats
  const transactionStats = {
    totalTransactions: transactions.length,
    buyTransactions: transactions.filter(t => t.type === "buy").length,
    sellTransactions: transactions.filter(t => t.type === "sell").length,
    totalBuyValue: transactions.filter(t => t.type === "buy").reduce((sum, t) => sum + ((parseFloat(t.quantity) * parseFloat(t.price)) || 0), 0),
    totalSellValue: transactions.filter(t => t.type === "sell").reduce((sum, t) => sum + ((parseFloat(t.quantity) * parseFloat(t.price)) || 0), 0)
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? "+" : ""}${(value || 0).toFixed(2)}%`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };



  // Content-only skeleton rendered inside the page shell (Navbar loads immediately)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — always renders immediately */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <DashboardContentSkeleton />
        ) : (
          <>
            {!user?.profile_completed && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <RiskIcon className="w-6 h-6 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        Complete Your Profile
                      </h3>
                      <p className="text-yellow-700">
                        Please complete the risk assessment to get personalized investment recommendations.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/risk-assessment")}
                    className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 ml-4"
                  >
                    <RiskIcon className="w-5 h-5" />
                    Take Assessment
                  </button>
                </div>
              </div>
            )}

            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <DashboardIcon className="w-8 h-8 text-indigo-600" />
                    <h2 className="text-3xl font-bold text-gray-800">
                      {getGreeting()}, {user?.name || "User"}! 👋
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Here's an overview of your wealth management journey.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Portfolio</p>
                    <p className="text-lg font-bold text-indigo-600">{formatCurrency(investmentSummary?.total_current_value || investments.reduce((s, i) => s + (parseFloat(i.current_value) || 0), 0))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Goals</p>
                    <p className="text-lg font-bold text-orange-600">{goals.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Trades</p>
                    <p className="text-lg font-bold text-teal-600">{transactions.length}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Charts Section */}
            {aggregateData && <DashboardCharts aggregateData={aggregateData} />}

            {/* Goals Stats Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-800">Goals Overview</h3>
                </div>
                <Link to="/goals" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-orange-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <TargetIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Total Goals</h3>
                      <p className="text-2xl font-bold text-gray-900">{goalStats.totalGoals}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <RefreshIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Active Goals</h3>
                      <p className="text-2xl font-bold text-blue-600">{goalStats.activeGoals}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
                      <p className="text-2xl font-bold text-green-600">{goalStats.completedGoals}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Monthly Contribution</h3>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(goalStats.totalMonthlyContribution)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Investments Stats Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <InvestmentIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Portfolio Overview</h3>
                </div>
                <Link to="/investments" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ChartIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Total Investments</h3>
                      <p className="text-2xl font-bold text-gray-900">{investmentStats.totalInvestments}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-indigo-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <MoneyIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Portfolio Value</h3>
                      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(investmentStats.totalValue)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-cyan-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-50 rounded-lg">
                      <InvestmentIcon className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Cost Basis</h3>
                      <p className="text-2xl font-bold text-cyan-600">{formatCurrency(investmentStats.totalCost)}</p>
                    </div>
                  </div>
                </Card>
                <Card className={`border-l-4 ${investmentStats.totalGainLoss >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${investmentStats.totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
                      <TrendingUpIcon className={`w-6 h-6 ${investmentStats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Total Gain/Loss</h3>
                      <p className={`text-2xl font-bold ${investmentStats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(investmentStats.totalGainLoss)}
                      </p>
                      <p className={`text-sm ${investmentStats.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(investmentStats.gainLossPercent)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Transactions Stats Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TransactionIcon className="w-6 h-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-800">Transaction Activity</h3>
                </div>
                <Link to="/transactions" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-teal-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <TransactionIcon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Total Transactions</h3>
                      <p className="text-2xl font-bold text-gray-900">{transactionStats.totalTransactions}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <TrendingUpIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Buy Orders</h3>
                      <p className="text-2xl font-bold text-emerald-600">{transactionStats.buyTransactions}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(transactionStats.totalBuyValue)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-rose-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg">
                      <TrendingUpIcon className="w-6 h-6 text-rose-600 rotate-180" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Sell Orders</h3>
                      <p className="text-2xl font-bold text-rose-600">{transactionStats.sellTransactions}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(transactionStats.totalSellValue)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <TargetIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Total Target Amount</h3>
                      <p className="text-2xl font-bold text-amber-600">{formatCurrency(goalStats.totalTargetAmount)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
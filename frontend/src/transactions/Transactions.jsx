import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import TransactionsTable from "./TransactionsTable";
import TransactionForm from "./TransactionForm";
import { getTransactions, createTransaction, getTransactionSummary } from "../api/transactions";
import { getCurrentUser } from "../api/auth";
import {
    TransactionIcon,
    PlusIcon,
    FilterIcon,
    DownloadIcon,
    ChartIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    SortAscIcon,
    SortDescIcon
} from "../common/Icons";
import Card from "../common/Card";
import { CardSkeleton } from "../common/Skeleton";

export default function Transactions() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        symbol: "",
        type: "buy",
        asset_type: "stock",
        quantity: "",
        price: "",
        fees: "0"
    });

    // Filter & Sort States
    const [dateRange, setDateRange] = useState("all"); // all, week, month, year, custom
    const [customDateFrom, setCustomDateFrom] = useState("");
    const [customDateTo, setCustomDateTo] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterAsset, setFilterAsset] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc"); // desc (newest), asc (oldest)

    useEffect(() => {
        checkProfileAndFetch();
    }, []);

    const checkProfileAndFetch = async () => {
        try {
            const user = await getCurrentUser();
            if (!user?.profile_completed) {
                toast.warning("Please complete your risk assessment first");
                navigate("/risk-assessment");
                return;
            }
            fetchData();
        } catch (err) {
            navigate("/login");
        }
    };

    const fetchData = async () => {
        try {
            const [transactionsData, summaryData] = await Promise.all([
                getTransactions(),
                getTransactionSummary()
            ]);
            setTransactions(transactionsData);
            setSummary(summaryData);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTransaction(formData);
            toast.success("Transaction recorded successfully");
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            symbol: "",
            type: "buy",
            asset_type: "stock",
            quantity: "",
            price: "",
            fees: "0"
        });
    };

    const handleCancel = () => {
        setShowModal(false);
        resetForm();
    };

    // Helper to check if a date is within 'X' range
    const isDateInRange = (dateStr, range) => {
        const date = new Date(dateStr);
        const now = new Date();

        // Reset hours to compare just dates roughly
        date.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        if (range === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
        }
        if (range === 'month') {
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return date >= monthAgo;
        }
        if (range === 'year') {
            const yearAgo = new Date(now);
            yearAgo.setFullYear(now.getFullYear() - 1);
            return date >= yearAgo;
        }
        return true;
    };

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        let matchDate = true;

        if (dateRange === 'custom') {
            const date = new Date(t.executed_at);
            const from = customDateFrom ? new Date(customDateFrom) : null;
            const to = customDateTo ? new Date(customDateTo) : null;
            if (to) to.setHours(23, 59, 59, 999);
            matchDate = (!from || date >= from) && (!to || date <= to);
        } else if (dateRange !== 'all') {
            matchDate = isDateInRange(t.executed_at, dateRange);
        }

        const matchType = filterType === "all" || t.type === filterType;
        const matchAsset = filterAsset === "all" || t.asset_type === filterAsset;

        return matchDate && matchType && matchAsset;
    }).sort((a, b) => {
        const dateA = new Date(a.executed_at);
        const dateB = new Date(b.executed_at);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // CSV Export Logic
    const exportToCSV = () => {
        if (filteredTransactions.length === 0) {
            toast.info("No transactions to export");
            return;
        }

        const headers = ["ID", "Symbol", "Type", "Asset Type", "Quantity", "Price", "Fees", "Total", "Date"];
        const rows = filteredTransactions.map(t => [
            t.id,
            t.symbol,
            t.type,
            t.asset_type,
            t.quantity,
            t.price,
            t.fees,
            (parseFloat(t.quantity) * parseFloat(t.price)) + parseFloat(t.fees),
            new Date(t.executed_at).toLocaleString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `wealth_tracker_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount || 0);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <TransactionIcon className="w-8 h-8 text-indigo-600" />
                            Transaction History
                        </h1>
                        <p className="text-gray-500 mt-1">Track and manage your investment activities</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={exportToCSV}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition duration-200 shadow-sm"
                        >
                            <DownloadIcon className="w-5 h-5 text-gray-500" />
                            Export
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg shadow-indigo-200"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Transaction
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {loading ? (
                        [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
                    ) : summary ? (
                        <>
                            <Card className="bg-white border-l-4 border-l-indigo-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total_transactions}</p>
                                    </div>
                                    <div className="p-3 bg-indigo-50 rounded-xl">
                                        <ChartIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                            </Card>
                            <Card className="bg-white border-l-4 border-l-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Buy Volume</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary.total_bought)}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-xl">
                                        <TrendingUpIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </Card>
                            <Card className="bg-white border-l-4 border-l-red-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Sell Volume</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary.total_sold)}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-xl">
                                        <TrendingDownIcon className="w-6 h-6 text-red-600" />
                                    </div>
                                </div>
                            </Card>
                        </>
                    ) : null}
                </div>

                {/* Filter & Sort Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        {/* Quick Dates */}
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                            {['all', 'week', 'month', 'year', 'custom'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === range
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {range === 'all' ? 'All Time' :
                                        range === 'custom' ? 'Custom Range' :
                                            `Last ${range.charAt(0).toUpperCase() + range.slice(1)}`}
                                </button>
                            ))}
                        </div>

                        {/* Filters & Sort */}
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                            {dateRange === 'custom' && (
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    <input
                                        type="date"
                                        className="border-none bg-transparent text-sm focus:ring-0 p-1"
                                        value={customDateFrom}
                                        onChange={(e) => setCustomDateFrom(e.target.value)}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="date"
                                        className="border-none bg-transparent text-sm focus:ring-0 p-1"
                                        value={customDateTo}
                                        onChange={(e) => setCustomDateTo(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>

                            <select
                                className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 py-2"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="buy">Buy Only</option>
                                <option value="sell">Sell Only</option>
                            </select>

                            <select
                                className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 py-2"
                                value={filterAsset}
                                onChange={(e) => setFilterAsset(e.target.value)}
                            >
                                <option value="all">All Assets</option>
                                <option value="stock">Stock</option>
                                <option value="crypto">Crypto</option>
                                <option value="bond">Bond</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                {sortOrder === 'desc' ? <SortDescIcon className="w-4 h-4" /> : <SortAscIcon className="w-4 h-4" />}
                                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <TransactionsTable
                    transactions={filteredTransactions}
                    summary={summary}
                    loading={loading}
                />
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Record Transaction
                        </h2>
                        <TransactionForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

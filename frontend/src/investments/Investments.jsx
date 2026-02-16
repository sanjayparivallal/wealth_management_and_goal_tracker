import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import InvestmentSummaryCards from "./InvestmentSummaryCards";
import InvestmentsTable from "./InvestmentsTable";
import InvestmentForm from "./InvestmentForm";
import { getInvestments, updateInvestment, getInvestmentSummary } from "../api/investments";
import { getCurrentUser } from "../api/auth";
import { InvestmentIcon, DownloadIcon } from "../common/Icons";
import { InvestmentsSkeleton } from "../common/Skeleton";

export default function Investments() {
    const navigate = useNavigate();
    const [investments, setInvestments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [formData, setFormData] = useState({
        asset_type: "stock",
        symbol: "",
        units: "",
        avg_buy_price: "",
        cost_basis: "",
        current_value: "",
        last_price: ""
    });
    const [filterAsset, setFilterAsset] = useState('all');
    const [sortOrder, setSortOrder] = useState('value_desc');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const [investmentsData, summaryData] = await Promise.all([
                getInvestments(),
                getInvestmentSummary()
            ]);
            setInvestments(investmentsData);
            setSummary(summaryData);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        checkProfileAndFetch();
    }, []);

    if (loading) {
        return <InvestmentsSkeleton />;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingInvestment) {
                await updateInvestment(editingInvestment.id, formData);
                toast.success("Investment updated successfully");
                setShowModal(false);
                setEditingInvestment(null);
                resetForm();
                fetchData();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = (investment) => {
        setEditingInvestment(investment);
        setFormData({
            asset_type: investment.asset_type,
            symbol: investment.symbol,
            units: investment.units,
            avg_buy_price: investment.avg_buy_price,
            cost_basis: investment.cost_basis,
            current_value: investment.current_value,
            last_price: investment.last_price
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            asset_type: "stock",
            symbol: "",
            units: "",
            avg_buy_price: "",
            cost_basis: "",
            current_value: "",
            last_price: ""
        });
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingInvestment(null);
        resetForm();
    };



    // Filter and Sort Logic
    const filteredInvestments = investments
        .filter(inv => {
            const matchesAsset = filterAsset === 'all' || inv.asset_type === filterAsset;
            const matchesSearch = inv.symbol.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesAsset && matchesSearch;
        })
        .sort((a, b) => {
            if (sortOrder === 'value_desc') return b.current_value - a.current_value;
            if (sortOrder === 'value_asc') return a.current_value - b.current_value;
            if (sortOrder === 'newest') return b.id - a.id;
            if (sortOrder === 'a_z') return a.symbol.localeCompare(b.symbol);
            return 0;
        });

    // Export to CSV
    const handleExport = () => {
        if (!filteredInvestments.length) {
            toast.warning("No investments to export");
            return;
        }

        const headers = ["Symbol", "Asset Type", "Units", "Avg Buy Price", "Current Price", "Cost Basis", "Current Value", "Gain/Loss", "Gain/Loss %"];
        const csvContent = [
            headers.join(","),
            ...filteredInvestments.map(inv => {
                const gainLoss = inv.current_value - inv.cost_basis;
                const gainLossPercent = (gainLoss / inv.cost_basis) * 100;
                return [
                    inv.symbol,
                    inv.asset_type,
                    inv.units,
                    inv.avg_buy_price,
                    inv.last_price,
                    inv.cost_basis,
                    inv.current_value,
                    gainLoss.toFixed(2),
                    gainLossPercent.toFixed(2) + '%'
                ].join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `portfolio_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <InvestmentIcon className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>
                    </div>
                </div>

                {/* Summary Cards */}
                <InvestmentSummaryCards summary={summary} />

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search symbol..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Asset Filter */}
                            <select
                                className="pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                value={filterAsset}
                                onChange={(e) => setFilterAsset(e.target.value)}
                            >
                                <option value="all">All Assets</option>
                                <option value="stock">Stocks</option>
                                <option value="etf">ETFs</option>
                                <option value="crypto">Crypto</option>
                                <option value="bond">Bonds</option>
                                <option value="mutual_fund">Mutual Funds</option>
                            </select>

                            {/* Sort */}
                            <select
                                className="pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="value_desc">High Value</option>
                                <option value="value_asc">Low Value</option>
                                <option value="newest">Newest Added</option>
                                <option value="a_z">Name (A-Z)</option>
                            </select>

                            {/* Export Button */}
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Investments Table */}
                <InvestmentsTable
                    investments={filteredInvestments}
                    onEdit={handleEdit}
                    loading={loading}
                />
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-xl animate-scaleIn">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                            Edit Investment
                        </h2>
                        <InvestmentForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isEditing={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

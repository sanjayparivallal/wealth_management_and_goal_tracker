import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import InvestmentsTable from "./InvestmentsTable";
import InvestmentForm from "./InvestmentForm";
import { getInvestments, updateInvestment, getInvestmentSummary } from "../api/investments";
import { getCurrentUser } from "../api/auth";
import { InvestmentIcon } from "../common/Icons";

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

                {/* Investments Table & Summary */}
                <InvestmentsTable
                    investments={investments}
                    summary={summary}
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

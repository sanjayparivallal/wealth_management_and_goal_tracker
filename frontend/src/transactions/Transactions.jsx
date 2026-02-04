import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import TransactionsTable from "./TransactionsTable";
import TransactionForm from "./TransactionForm";
import { getTransactions, createTransaction, getTransactionSummary } from "../api/transactions";
import { getCurrentUser } from "../api/auth";
import { TransactionIcon, PlusIcon } from "../common/Icons";

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header & Add Button */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <TransactionIcon className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Transaction
                    </button>
                </div>

                {/* Transactions Table & Summary */}
                <TransactionsTable
                    transactions={transactions}
                    summary={summary}
                    loading={loading}
                />
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

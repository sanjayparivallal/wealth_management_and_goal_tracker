import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import Card from "../common/Card";
import GoalsTable from "./GoalsTable";
import GoalForm from "./GoalForm";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../api/goals";
import { getCurrentUser } from "../api/auth";
import { TargetIcon, CheckIcon, MoneyIcon, CalendarIcon, PlusIcon } from "../common/Icons";
import { GoalsSkeleton } from "../common/Skeleton";

export default function Goals() {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [formData, setFormData] = useState({
        goal_type: "retirement",
        target_amount: "",
        target_date: "",
        monthly_contribution: "",
        status: "active"
    });

    const fetchGoals = async () => {
        try {
            const data = await getGoals();
            setGoals(data);
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
            fetchGoals();
        } catch (err) {
            navigate("/login");
        }
    };

    useEffect(() => {
        checkProfileAndFetch();
    }, []);

    if (loading) {
        return <GoalsSkeleton />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGoal) {
                await updateGoal(editingGoal.id, formData);
                toast.success("Goal updated successfully");
            } else {
                await createGoal(formData);
                toast.success("Goal created successfully");
            }
            setShowModal(false);
            setEditingGoal(null);
            resetForm();
            fetchGoals();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            goal_type: goal.goal_type,
            target_amount: goal.target_amount,
            target_date: goal.target_date,
            monthly_contribution: goal.monthly_contribution,
            status: goal.status
        });
        setShowModal(true);
    };

    const handleDelete = async (goalId) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            try {
                await deleteGoal(goalId);
                toast.success("Goal deleted successfully");
                fetchGoals();
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            goal_type: "retirement",
            target_amount: "",
            target_date: "",
            monthly_contribution: "",
            status: "active"
        });
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingGoal(null);
        resetForm();
    };

    // Calculate stats from goals
    const stats = {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === "active").length,
        completedGoals: goals.filter(g => g.status === "completed").length,
        totalTargetAmount: goals.reduce((sum, g) => sum + (parseFloat(g.target_amount) || 0), 0),
        totalMonthlyContribution: goals.filter(g => g.status === "active").reduce((sum, g) => sum + (parseFloat(g.monthly_contribution) || 0), 0)
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
                {/* Header & Add Button */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <TargetIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
                    </div>
                    <button
                        onClick={() => {
                            setEditingGoal(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add New Goal
                    </button>
                </div>

                {/* Stats Cards */}
                {!loading && goals.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card className="border-l-4 border-l-gray-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <TargetIcon className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 text-sm font-medium">Total Goals</h3>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CheckIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 text-sm font-medium">Active Goals</h3>
                                    <p className="text-2xl font-bold text-blue-600">{stats.activeGoals}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MoneyIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 text-sm font-medium">Total Target</h3>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalTargetAmount)}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CalendarIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-gray-500 text-sm font-medium">Monthly</h3>
                                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalMonthlyContribution)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Goals Table */}
                <GoalsTable
                    goals={goals}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={loading}
                />
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {editingGoal ? "Edit Goal" : "Create New Goal"}
                        </h2>
                        <GoalForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isEditing={!!editingGoal}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { createSimulation } from '../api/simulations';
import {
    CloseIcon,
    SaveIcon,
    TrendingUpIcon,
    MoneyIcon,
    CalendarIcon,
    ClockIcon,
    RiskIcon,
    ChartIcon,
    TargetIcon
} from '../common/Icons';

const CreateSimulationModal = ({ isOpen, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        scenario_name: '',
        initial_amount: '',
        monthly_contribution: '',
        time_horizon_years: '',
        expected_return_rate: '',
        inflation_rate: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Convert string inputs to numbers for API
        const submissionData = {
            scenario_name: formData.scenario_name,
            initial_amount: Number(formData.initial_amount),
            monthly_contribution: Number(formData.monthly_contribution),
            time_horizon_years: Number(formData.time_horizon_years),
            expected_return_rate: Number(formData.expected_return_rate),
            inflation_rate: Number(formData.inflation_rate)
        };

        try {
            await createSimulation(submissionData);
            onCreated();
        } catch (error) {
            console.error("Error creating simulation:", error);
            alert("Failed to create simulation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id === 'time_horizon' ? 'time_horizon_years' :
                id === 'expected_return' ? 'expected_return_rate' :
                    id]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl overflow-hidden animate-scaleIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <TrendingUpIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Run New Simulation</h2>
                            <p className="text-sm text-gray-500">Project your wealth growth over time</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Scenario Name */}
                    <div className="group">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg group-focus-within:from-indigo-200 group-focus-within:to-indigo-100 transition-all duration-300">
                                <TargetIcon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <input
                                type="text"
                                id="scenario_name"
                                required
                                placeholder="Scenario Name"
                                className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                                value={formData.scenario_name}
                                onChange={handleChange}
                            />
                            <label
                                htmlFor="scenario_name"
                                className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                            >
                                Scenario Name (e.g. Retirement)
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Initial Amount */}
                        <div className="group">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg group-focus-within:from-green-200 group-focus-within:to-green-100 transition-all duration-300">
                                    <MoneyIcon className="w-4 h-4 text-green-600" />
                                </div>
                                <input
                                    type="number"
                                    id="initial_amount"
                                    required
                                    min="0"
                                    placeholder="Initial Amount ($)"
                                    className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                                    value={formData.initial_amount}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="initial_amount"
                                    className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                                >
                                    Initial Amount ($)
                                </label>
                            </div>
                        </div>

                        {/* Monthly Contribution */}
                        <div className="group">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg group-focus-within:from-purple-200 group-focus-within:to-purple-100 transition-all duration-300">
                                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                                </div>
                                <input
                                    type="number"
                                    id="monthly_contribution"
                                    required
                                    min="0"
                                    placeholder="Monthly Contribution ($)"
                                    className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                                    value={formData.monthly_contribution}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="monthly_contribution"
                                    className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                                >
                                    Monthly Contribution ($)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Time Horizon */}
                        <div className="group">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-focus-within:from-blue-200 group-focus-within:to-blue-100 transition-all duration-300">
                                    <ClockIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <input
                                    type="number"
                                    id="time_horizon"
                                    required
                                    min="1"
                                    max="100"
                                    placeholder="Years"
                                    className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                                    value={formData.time_horizon_years}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="time_horizon"
                                    className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                                >
                                    Time (Years)
                                </label>
                            </div>
                        </div>

                        {/* Expected Return */}
                        <div className="group">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg group-focus-within:from-emerald-200 group-focus-within:to-emerald-100 transition-all duration-300">
                                    <TrendingUpIcon className="w-4 h-4 text-emerald-600" />
                                </div>
                                <input
                                    type="number"
                                    id="expected_return"
                                    required
                                    step="0.1"
                                    placeholder="Return (%)"
                                    className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                                    value={formData.expected_return_rate}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="expected_return"
                                    className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                                >
                                    Return (%)
                                </label>
                            </div>
                        </div>

                        {/* Inflation */}
                        <div className="group">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-red-100 to-red-50 rounded-lg group-focus-within:from-red-200 group-focus-within:to-red-100 transition-all duration-300">
                                    <RiskIcon className="w-4 h-4 text-red-600" />
                                </div>
                                <input
                                    type="number"
                                    id="inflation_rate"
                                    required
                                    step="0.1"
                                    placeholder="Inflation (%)"
                                    className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                                    value={formData.inflation_rate}
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="inflation_rate"
                                    className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                                >
                                    Inflation (%)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 px-5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Calculating...' : (
                                    <>
                                        <TrendingUpIcon className="w-5 h-5" />
                                        Run Simulation
                                    </>
                                )}
                            </span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateSimulationModal;

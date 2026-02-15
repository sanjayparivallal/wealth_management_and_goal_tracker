import React, { useState, useEffect } from 'react';
import { getSimulations, deleteSimulation } from '../api/simulations';
import CreateSimulationModal from './CreateSimulationModal';
import SimulationResults from './SimulationResults';
import Navbar from '../common/Navbar';
import Card from '../common/Card';
import { PlusIcon, TrashIcon, TrendingUpIcon, CalendarIcon, MoneyIcon, ChartIcon, TargetIcon } from '../common/Icons';

const SimulationsPage = () => {
    const [simulations, setSimulations] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSimulation, setSelectedSimulation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSimulations();
    }, []);

    const fetchSimulations = async () => {
        try {
            const data = await getSimulations();
            setSimulations(data);
        } catch (error) {
            console.error("Error fetching simulations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this simulation?")) {
            try {
                await deleteSimulation(id);
                fetchSimulations();
                if (selectedSimulation && selectedSimulation.id === id) {
                    setSelectedSimulation(null);
                }
            } catch (error) {
                console.error("Error deleting simulation:", error);
            }
        }
    };

    const handleSimulationCreated = () => {
        fetchSimulations();
        setIsCreateModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                            <TrendingUpIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Simulations</h1>
                            <p className="text-gray-500 mt-1 font-medium">Model your financial future with powerful "What-If" scenarios.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Scenario
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Simulation List - Sidebar Style */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <ChartIcon className="w-5 h-5 text-indigo-500" />
                                Your Scenarios
                            </h2>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{simulations.length} Saved</span>
                        </div>

                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-gray-200 rounded-xl w-full"></div>
                                ))}
                            </div>
                        ) : simulations.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TargetIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Scenarios Yet</h3>
                                <p className="text-gray-500 text-sm mb-6">Create your first simulation to start projecting wealth.</p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="text-indigo-600 font-semibold text-sm hover:underline"
                                >
                                    + Create New Scenario
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {simulations.map((sim) => (
                                    <div
                                        key={sim.id}
                                        onClick={() => setSelectedSimulation(sim)}
                                        className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${selectedSimulation?.id === sim.id
                                                ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500 z-10'
                                                : 'bg-white border-transparent hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                    >
                                        {/* Active Indicator Bar */}
                                        {selectedSimulation?.id === sim.id && (
                                            <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full"></div>
                                        )}

                                        <div className="flex justify-between items-start mb-3 pl-2">
                                            <h3 className={`font-bold text-lg ${selectedSimulation?.id === sim.id ? 'text-indigo-700' : 'text-gray-800 group-hover:text-indigo-600 transition-colors'}`}>
                                                {sim.scenario_name}
                                            </h3>
                                            <button
                                                onClick={(e) => handleDelete(e, sim.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                title="Delete Scenario"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pl-2">
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <MoneyIcon className="w-4 h-4 text-green-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Monthly</span>
                                                    <span className="text-sm font-semibold text-gray-700">${sim.assumptions.monthly_contribution}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                <CalendarIcon className="w-4 h-4 text-blue-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Horizon</span>
                                                    <span className="text-sm font-semibold text-gray-700">{sim.assumptions.time_horizon_years} Yrs</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Simulation Details/Results - Main Content Area */}
                    <div className="lg:col-span-8">
                        {selectedSimulation ? (
                            <div className="animate-fadeIn">
                                <SimulationResults simulation={selectedSimulation} />
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center">
                                <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                                    <TrendingUpIcon className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a Scenario</h3>
                                <p className="text-gray-500 max-w-md text-lg leading-relaxed">
                                    Click on a scenario from the sidebar to view detailed growth projections, interactive charts, and key insights.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {isCreateModalOpen && (
                    <CreateSimulationModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreated={handleSimulationCreated}
                    />
                )}
            </main>
        </div>
    );
};

export default SimulationsPage;

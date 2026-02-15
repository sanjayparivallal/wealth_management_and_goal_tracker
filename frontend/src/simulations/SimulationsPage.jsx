import React, { useState, useEffect } from 'react';
import { getSimulations, deleteSimulation } from '../api/simulations';
import CreateSimulationModal from './CreateSimulationModal';
import SimulationResults from './SimulationResults';
import Navbar from '../common/Navbar';
import Card from '../common/Card';
import { PlusIcon, TrashIcon, TrendingUpIcon, CalendarIcon, MoneyIcon } from '../common/Icons';

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
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <TrendingUpIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Financial Simulations</h1>
                            <p className="text-gray-500 mt-1">Run "What-If" scenarios to plan your financial future.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Simulation
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Simulation List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Scenarios</h2>

                        {loading ? (
                            <div className="text-center text-gray-500 py-8">Loading...</div>
                        ) : simulations.length === 0 ? (
                            <Card className="text-center py-8">
                                <TrendingUpIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No simulations yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Create one to see projections!</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {simulations.map((sim) => (
                                    <div
                                        key={sim.id}
                                        onClick={() => setSelectedSimulation(sim)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all bg-white shadow-sm ${selectedSimulation?.id === sim.id
                                            ? 'border-indigo-500 ring-1 ring-indigo-500'
                                            : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-semibold ${selectedSimulation?.id === sim.id ? 'text-indigo-700' : 'text-gray-800'
                                                }`}>
                                                {sim.scenario_name}
                                            </h3>
                                            <button
                                                onClick={(e) => handleDelete(e, sim.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <MoneyIcon className="w-3 h-3" />
                                                <span>
                                                    ${sim.assumptions.monthly_contribution}/mo
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>
                                                    {sim.assumptions.time_horizon_years} Years
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Simulation Details/Results */}
                    <div className="lg:col-span-2">
                        {selectedSimulation ? (
                            <SimulationResults simulation={selectedSimulation} />
                        ) : (
                            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-gray-200 shadow-none bg-gray-50">
                                <TrendingUpIcon className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Simulation</h3>
                                <p className="text-gray-500 text-center max-w-md">
                                    Click on a scenario from the list to view detailed projections and charts.
                                </p>
                            </Card>
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

import axiosInstance from './axiosConfig';

export const createSimulation = async (simulationData) => {
    const response = await axiosInstance.post('/simulations', simulationData);
    return response.data;
};

export const getSimulations = async () => {
    const response = await axiosInstance.get('/simulations');
    return response.data;
};

export const deleteSimulation = async (id) => {
    const response = await axiosInstance.delete(`/simulations/${id}`);
    return response.data;
};

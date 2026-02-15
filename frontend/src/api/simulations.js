import axios from 'axios';

const API_URL = 'http://localhost:8000';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const createSimulation = async (simulationData) => {
    const response = await axios.post(`${API_URL}/simulations`, simulationData, getAuthHeader());
    return response.data;
};

export const getSimulations = async () => {
    const response = await axios.get(`${API_URL}/simulations`, getAuthHeader());
    return response.data;
};

export const deleteSimulation = async (id) => {
    const response = await axios.delete(`${API_URL}/simulations/${id}`, getAuthHeader());
    return response.data;
};

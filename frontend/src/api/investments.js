import axiosInstance from "./axiosConfig";

const API_URL = "/investments";

export const getInvestments = async () => {
    try {
        const res = await axiosInstance.get(API_URL);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to fetch investments");
    }
};

export const getInvestmentSummary = async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/summary`);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to fetch investment summary");
    }
};

export const createInvestment = async (investmentData) => {
    try {
        const res = await axiosInstance.post(API_URL, investmentData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to create investment");
    }
};

export const updateInvestment = async (investmentId, investmentData) => {
    try {
        const res = await axiosInstance.put(`${API_URL}/${investmentId}`, investmentData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to update investment");
    }
};

export const deleteInvestment = async (investmentId) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/${investmentId}`);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to delete investment");
    }
};

import axiosInstance from "./axiosConfig";

const API_URL = "/transactions";

export const getTransactions = async () => {
    try {
        const res = await axiosInstance.get(API_URL);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to fetch transactions");
    }
};

export const getTransactionSummary = async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/summary`);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to fetch transaction summary");
    }
};

export const createTransaction = async (transactionData) => {
    try {
        const res = await axiosInstance.post(API_URL, transactionData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to create transaction");
    }
};

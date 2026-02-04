import axiosInstance from "./axiosConfig";

const API_URL = "/goals";

export const getGoals = async () => {
    try {
        const res = await axiosInstance.get(API_URL);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to fetch goals");
    }
};

export const createGoal = async (goalData) => {
    try {
        const res = await axiosInstance.post(API_URL, goalData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to create goal");
    }
};

export const updateGoal = async (goalId, goalData) => {
    try {
        const res = await axiosInstance.put(`${API_URL}/${goalId}`, goalData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to update goal");
    }
};

export const deleteGoal = async (goalId) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/${goalId}`);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to delete goal");
    }
};

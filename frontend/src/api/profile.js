import axiosInstance from "./axiosConfig";

const API_URL = "/profile";

export const getProfile = async () => {
    try {
        const res = await axiosInstance.get(API_URL);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to fetch profile");
    }
};

export const updateProfile = async (profileData) => {
    try {
        const res = await axiosInstance.put(API_URL, profileData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to update profile");
    }
};

export const changePassword = async (passwordData) => {
    try {
        const res = await axiosInstance.put(`${API_URL}/password`, passwordData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || "Failed to change password");
    }
};

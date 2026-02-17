import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Request interceptor - add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle session timeout (401)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if we're not already on login page
            const isLoginPage = window.location.pathname === "/" || window.location.pathname === "/login";

            if (!isLoginPage) {
                // Clear auth data
                localStorage.removeItem("access_token");
                localStorage.removeItem("token_type");

                // Show toast notification
                toast.error("Session expired. Please login again.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Use setTimeout to ensure toast shows before redirect
                setTimeout(() => {
                    window.location.replace("/login");
                }, 100);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

import axios from "axios";

const API_URL = "http://localhost:8000/auth";

export const signupUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/signup`, data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Signup failed");
  }
};

export const loginUser = async (data) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", data.email);
    formData.append("password", data.password);

    const res = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    // Store the token in localStorage
    if (res.data.access_token) {
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("token_type", res.data.token_type);
    }

    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
};

// Logout function
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
};

// Get current token
export const getToken = () => {
  return localStorage.getItem("access_token");
};

// Get current user info
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return res.data;
  } catch (err) {
    // Don't log 401 errors - they're expected when not logged in
    if (err.response?.status !== 401) {
      console.error("Failed to get current user:", err);
    }
    throw new Error(err.response?.data?.detail || "Failed to get user info");
  }
};


// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

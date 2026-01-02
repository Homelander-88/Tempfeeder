import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE as string) || "https://smithsonian-andrews-approximately-madrid.trycloudflare.com/api", // your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // stored after login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear authentication and redirect
            console.log('Token expired or invalid - logging out user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login page
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

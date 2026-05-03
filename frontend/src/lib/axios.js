import axios from "axios";

// Configurable API URL for localhost development and production
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

console.log("Using API URL:", API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

export default axiosInstance;
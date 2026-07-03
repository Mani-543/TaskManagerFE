import axios from "axios";

// Use local backend in development, production in build
const API_URL =
  process.env.NODE_ENV === "development" && process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_API_URL || "https://taskmanagerbe-cx96.onrender.com/api";

const API = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
});

// attach token with proper headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  req.headers["Content-Type"] = "application/json";
  return req;
});

// Add response interceptor for better error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;
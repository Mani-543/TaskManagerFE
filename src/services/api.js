import axios from "axios";

const API = axios.create({
  baseURL: "https://taskmanagerbackend-j136.onrender.com//api",
});

// Automatically attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`; // ✅ FIXED
  }

  return req;
});

export default API;
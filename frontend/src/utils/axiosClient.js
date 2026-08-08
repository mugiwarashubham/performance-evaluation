import axios from 'axios';

// Single canonical axios instance. The original codebase had two duplicate
// copies of this file (services/api.jsx and utils/axiosClient.js) imported
// inconsistently across pages — consolidated to one.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosClient;

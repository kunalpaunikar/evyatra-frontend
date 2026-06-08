// backend connection 

import axios from 'axios';

// Base URL — This will be automatically applied to every API call.
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL
        || 'http://localhost:8080/api',
});

// Automatically add the JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
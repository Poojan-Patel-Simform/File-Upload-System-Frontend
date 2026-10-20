import axios from "axios";

/** Shared axios instance pointed at the backend API (NEXT_PUBLIC_API_ENDPOINT). */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
});

export default api;

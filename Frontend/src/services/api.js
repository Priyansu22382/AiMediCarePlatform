import axios from "axios";

const api = axios.create({
  baseURL: "https://aimedicareplatform.onrender.com",
  withCredentials: true,
});

export default api;

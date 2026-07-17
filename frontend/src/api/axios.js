import axios from "axios";

import {
  getApiErrorMessage,
  notifyError
}
from "../utils/toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (
    import.meta.env.PROD
      ? "/api"
      : "http://localhost:5000/api"
  );

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {

  const token =
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response)=>
    response,
  (error)=>{
    if(
      error.response?.status === 401 &&
      localStorage.getItem("token")
    ){
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if(window.location.pathname !== "/"){
        window.location.assign("/");
      }
    }

    notifyError(
      getApiErrorMessage(error)
    );

    return Promise.reject(error);
  }
);

export default api;

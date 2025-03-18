import axios from 'axios';
import { toast } from 'react-toastify';

// Configuración de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Función para esperar entre reintentos
const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// Función para determinar si debemos reintentar
const shouldRetry = (error) => {
  const { response, config } = error;
  // Solo reintentar en errores 5xx y si no hemos excedido el máximo de intentos
  return (
    response?.status >= 500 &&
    (!config.retryCount || config.retryCount < MAX_RETRIES)
  );
};

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas con reintentos
api.interceptors.response.use(
  (response) => {
    if (response.data?.data) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const { config } = error;

    if (!shouldRetry(error)) {
      return Promise.reject(error);
    }

    // Incrementar el contador de reintentos
    config.retryCount = (config.retryCount || 0) + 1;

    // Mostrar notificación de reintento
    toast.info(`Reintentando conexión... (Intento ${config.retryCount} de ${MAX_RETRIES})`, {
      position: "top-right",
      autoClose: 2000,
    });

    // Esperar antes de reintentar
    await wait(RETRY_DELAY * config.retryCount);

    // Reintentar la solicitud
    return api(config);
  }
);

// Funciones de API con manejo de errores
const handleApiError = (error) => {
  let message = 'Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.responseMessage) {
    message = error.response.data.responseMessage;
  }

  if (error.response?.status === 401) {
    message = 'Usuario o contraseña incorrectos';
  }
  
  if (error.response?.status >= 500) {
    toast.error(`Error del servidor: ${message}`, {
      position: "top-right",
      autoClose: 5000,
    });
  }
  
  const enhancedError = new Error(message);
  enhancedError.response = error.response;
  enhancedError.status = error.response?.status;
  throw enhancedError;
};

export const apiService = {
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async post(url, data, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async put(url, data, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default apiService; 
import axios from 'axios';
import authService from './authService';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = authService.getToken();

    // Si el token está por expirar, intentar refrescarlo
    if (token && authService.isTokenExpired()) {
      try {
        token = await authService.refreshToken();
      } catch (error) {
        // Si no se puede refrescar el token, redirigir al login
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refrescar el token
        const token = await authService.refreshToken();
        
        // Actualizar el token en la petición original
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Reintentar la petición original
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si no se puede refrescar el token, redirigir al login
        authService.removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 
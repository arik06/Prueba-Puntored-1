import { jwtDecode } from 'jwt-decode';

class AuthService {
  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded) {
        localStorage.setItem('token', token);
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      throw new Error('Token inválido');
    }
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  isTokenExpired(token = this.getToken()) {
    if (!token) return true;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true;
    }
  }

  isAuthenticated() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }

  getDecodedToken() {
    try {
      const token = this.getToken();
      return token ? jwtDecode(token) : null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al refrescar el token');
      }

      const data = await response.json();
      if (data.data?.token) {
        this.setToken(data.data.token);
        return data.data.token;
      }
      throw new Error('Token de refresco inválido');
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }
}

export default new AuthService(); 
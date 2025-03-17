export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
  
    if (!token) return false;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el token
      const exp = payload.exp * 1000; // Convertir a milisegundos
      if (Date.now() >= exp) {
        localStorage.removeItem('token'); // Eliminar token si está expirado
        return false;
      }
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      return false;
    }
  };
  
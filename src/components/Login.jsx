import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import apiService from '../services/apiService';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    if (token && !authService.isTokenExpired(token)) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.post('/authenticate', { 
        username, 
        password 
      });

      if (response?.data?.token) {
        authService.setToken(response.data.token);
        toast.success('¡Inicio de sesión exitoso!', {
          position: "top-right",
          autoClose: 2000,
        });
        navigate('/dashboard');
      } else if (response?.token) {
        authService.setToken(response.token);
        toast.success('¡Inicio de sesión exitoso!', {
          position: "top-right",
          autoClose: 2000,
        });
        navigate('/dashboard');
      } else {
        console.error('Estructura de respuesta:', response);
        throw new Error('No se recibió el token de acceso');
      }
    } catch (err) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response?.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intente más tarde';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      
      setError(errorMessage);
      console.error('Error de autenticación:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="login-card">
        <Card.Body>
          <div className="text-center mb-4">
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: '80px', 
                marginBottom: '1.5rem',
                animation: 'fadeIn 0.5s ease-in'
              }} 
            />
            <h3 className="mb-4">Iniciar Sesión</h3>
          </div>
          
          {error && (
            <Alert 
              variant="danger" 
              className="mb-4 text-center"
              style={{ animation: 'shake 0.5s ease-in-out' }}
            >
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Usuario</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                required
                disabled={isLoading}
                className="py-2"
                placeholder="Ingrese su usuario"
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="py-2"
                placeholder="Ingrese su contraseña"
              />
            </Form.Group>
            
            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={isLoading || !username || !password}
              style={{ 
                fontSize: '1.1rem',
                transition: 'all 0.3s ease'
              }}
            >
              {isLoading ? (
                <div className="d-flex align-items-center justify-content-center">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Iniciando sesión...
                </div>
              ) : 'Iniciar Sesión'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;

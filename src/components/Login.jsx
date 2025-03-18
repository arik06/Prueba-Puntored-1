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
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/dashboard');
      } else {
        throw new Error('No se recibió el token de acceso');
      }
    } catch (err) {
      console.error('Error en login:', err);
      const errorMessage = err.response?.data?.responseMessage || 'Error al iniciar sesión';
      
      if (err.response?.status === 401) {
        toast.error('Usuario o contraseña incorrectos', {
          position: "top-right",
          autoClose: 4000,
        });
      } else if (err.response?.status >= 500) {
        toast.error('Error del servidor. Reintentando...', {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        });
      }
      
      setError(errorMessage);
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
                onChange={(e) => setUsername(e.target.value)}
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
              disabled={isLoading}
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

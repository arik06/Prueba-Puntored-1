import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, InputGroup, Image } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import { PaymentContext } from '../context/PaymentContext';
import puntoredLogo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { loading, error, setLoading, setError } = useContext(PaymentContext);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        navigate('/dashboard');
      } else {
        setError(data.responseMessage || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      setError('Error al intentar iniciar sesión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-5 shadow-lg login-card">
        <Card.Body className="text-center">
          <h1 className="fw-bold">Bienvenidos</h1>
          <h3 className="text-muted">A su gestión de pagos</h3>

          <div className="text-center mb-4">
            <Image src={puntoredLogo} alt="Puntored Logo" width={200} />
          </div>

          <h3 className="text-center mb-4">Iniciar Sesión</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Usuario</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaUser />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={credentials.username}
                  onChange={handleChange}
                  name="username"
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Ingrese su contraseña"
                  value={credentials.password}
                  onChange={handleChange}
                  name="password"
                  required
                />
              </InputGroup>
            </Form.Group>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;

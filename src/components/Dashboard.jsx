import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-5 shadow-lg" style={{ width: '100%', maxWidth: '800px' }}>
        <Card.Body className="text-center">
          <h1 className="fw-bold mb-4">Dashboard</h1>
          <p className="text-muted mb-4">Bienvenido al sistema de gestión de pagos</p>
          <Button variant="outline-danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;

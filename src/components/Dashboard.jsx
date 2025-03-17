import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { FaPlus, FaSignOutAlt } from 'react-icons/fa';

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
          <p className="text-muted mb-5">Bienvenido al sistema de gestión de pagos</p>
          
          <Row className="justify-content-center mb-4">
            <Col xs={12} md={6}>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 mb-3"
                onClick={() => navigate('/create-payment')}
              >
                <FaPlus className="me-2" />
                Crear Nueva Referencia
              </Button>
            </Col>
          </Row>

          <Button variant="outline-danger" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Cerrar Sesión
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;

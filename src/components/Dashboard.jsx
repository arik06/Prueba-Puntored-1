import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Modal, Form, Alert, Navbar } from 'react-bootstrap';
import { FaPlus, FaSignOutAlt, FaSearch, FaTable, FaChartBar, FaBars } from 'react-icons/fa';
import DashboardCharts from './DashboardCharts';
import NotificationBell from './NotificationBell';
import logo from '../assets/logo.png';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [reference, setReference] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchError('');

    // Validar que los campos no estén vacíos y cumplan con el formato esperado
    if (!reference.trim() || !paymentId.trim()) {
      setSearchError('Todos los campos son obligatorios');
      return;
    }

    // Validar que la referencia tenga el formato correcto (30 caracteres)
    if (reference.trim().length !== 30) {
      setSearchError('La referencia debe tener 30 caracteres');
      return;
    }

    // Si todo está bien, navegar a la vista de detalles
    navigate(`/view-payment/${reference.trim()}/${paymentId.trim()}`);
    setShowModal(false);
    
    // Limpiar los campos
    setReference('');
    setPaymentId('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchError('');
    setReference('');
    setPaymentId('');
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <Navbar bg="white" className="shadow-sm py-3">
        <Container fluid>
          <div className="mx-auto d-flex justify-content-between align-items-center" style={{ maxWidth: '752px', width: '100%' }}>
            <div className="d-flex align-items-center">
              <img 
                src={logo} 
                alt="Logo" 
                style={{ height: '40px', marginRight: '15px' }}
              />
              <Navbar.Brand className="m-0 h1">Dashboard</Navbar.Brand>
            </div>
            <div className={`header-actions ${showMobileMenu ? 'show' : ''}`}>
              <NotificationBell />
              <Button 
                variant="outline-danger"
                className="btn"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span className="desktop-only">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </Container>
      </Navbar>

      {/* Contenido Principal */}
      <Container fluid className="flex-grow-1 py-4">
        <div className="mx-auto" style={{ maxWidth: '752px' }}>
          {/* Tarjetas de Acciones */}
          <Row className="g-4 mb-4">
            <Col xs={12} md={6} lg={4}>
              <Card className="h-100 border-primary hover-shadow">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-4 mb-3">
                    <FaPlus className="display-4 text-primary" />
                  </div>
                  <h4>Crear Referencia</h4>
                  <p className="text-muted">Genera una nueva referencia de pago</p>
                  <Button 
                    variant="primary" 
                    className="mt-auto w-100"
                    onClick={() => navigate('/create-payment')}
                  >
                    Crear Nueva
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Card className="h-100 border-info hover-shadow">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div className="rounded-circle bg-info bg-opacity-10 p-4 mb-3">
                    <FaSearch className="display-4 text-info" />
                  </div>
                  <h4>Buscar Referencia</h4>
                  <p className="text-muted">Consulta una referencia específica</p>
                  <Button 
                    variant="info" 
                    className="mt-auto w-100 text-white"
                    onClick={() => setShowModal(true)}
                  >
                    Buscar
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Card className="h-100 border-success hover-shadow">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div className="rounded-circle bg-success bg-opacity-10 p-4 mb-3">
                    <FaTable className="display-4 text-success" />
                  </div>
                  <h4>Ver Referencias</h4>
                  <p className="text-muted">Lista todas las referencias de pago</p>
                  <Button 
                    variant="success" 
                    className="mt-auto w-100"
                    onClick={() => navigate('/payment-list')}
                  >
                    Ver Lista
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Sección de Gráficas */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3">
              <h4 className="m-0">
                <FaChartBar className="me-2" />
                Estadísticas
              </h4>
            </Card.Header>
            <Card.Body>
              <DashboardCharts />
            </Card.Body>
          </Card>
        </div>
      </Container>

      {/* Modal de Búsqueda */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Consultar Referencia de Pago</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSearchSubmit}>
          <Modal.Body>
            {searchError && (
              <Alert variant="danger" className="mb-3">
                {searchError}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Número de Referencia</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el número de referencia (30 caracteres)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={30}
                required
              />
              <Form.Text className="text-muted">
                La referencia debe tener exactamente 30 caracteres
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ID de Pago</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el ID de pago"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Buscar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;

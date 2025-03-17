import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSignOutAlt, FaSearch, FaTable } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [reference, setReference] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [searchError, setSearchError] = useState('');

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
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-5 shadow-lg" style={{ width: '100%', maxWidth: '800px' }}>
        <Card.Body className="text-center">
          <h1 className="fw-bold mb-4">Dashboard</h1>
          <p className="text-muted mb-5">Bienvenido al sistema de gestión de pagos</p>
          
          <Row className="justify-content-center mb-4">
            <Col xs={12} md={4} className="mb-3">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={() => navigate('/create-payment')}
              >
                <FaPlus className="me-2" />
                Crear Referencia
              </Button>
            </Col>
            <Col xs={12} md={4} className="mb-3">
              <Button 
                variant="info" 
                size="lg" 
                className="w-100 text-white"
                onClick={() => setShowModal(true)}
              >
                <FaSearch className="me-2" />
                Buscar Referencia
              </Button>
            </Col>
            <Col xs={12} md={4} className="mb-3">
              <Button 
                variant="success" 
                size="lg" 
                className="w-100"
                onClick={() => navigate('/payment-list')}
              >
                <FaTable className="me-2" />
                Ver Referencias
              </Button>
            </Col>
          </Row>

          <Button variant="outline-danger" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Cerrar Sesión
          </Button>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
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
    </Container>
  );
};

export default Dashboard;

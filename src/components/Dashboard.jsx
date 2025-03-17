import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSignOutAlt, FaSearch, FaTable } from 'react-icons/fa';
import DashboardCharts from './DashboardCharts';

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
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Dashboard</h1>
                <Button variant="outline-danger" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </Button>
              </div>

              <Row className="g-4 mb-4">
                <Col md={4}>
                  <Card className="h-100 border-primary">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                      <FaPlus className="display-4 mb-3 text-primary" />
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
                <Col md={4}>
                  <Card className="h-100 border-info">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                      <FaSearch className="display-4 mb-3 text-info" />
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
                <Col md={4}>
                  <Card className="h-100 border-success">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
                      <FaTable className="display-4 mb-3 text-success" />
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

              {/* Componente de Gráficas */}
              <DashboardCharts />
            </Card.Body>
          </Card>
        </Col>
      </Row>

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

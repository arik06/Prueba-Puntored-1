import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Badge, Button, Form, InputGroup, Card, Modal, Alert } from 'react-bootstrap';
import { FaSearch, FaCopy, FaCheck, FaEye, FaArrowLeft, FaPlus, FaFilePdf, FaBan } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { PaymentContext } from '../context/PaymentContext';
import { generatePaymentPDF } from '../utils/pdfGenerator';

const PaymentList = () => {
  const navigate = useNavigate();
  const { paymentsList, cancelPayment, error: contextError } = useContext(PaymentContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    setCopiedId(reference);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      '01': { variant: 'warning', text: 'Pendiente' },
      '02': { variant: 'success', text: 'Pagado' },
      '03': { variant: 'danger', text: 'Cancelado' },
      '04': { variant: 'secondary', text: 'Expirado' }
    };

    const config = statusConfig[status] || { variant: 'info', text: 'Desconocido' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const handleDownloadPDF = (payment) => {
    const doc = generatePaymentPDF(payment);
    doc.save(`comprobante-${payment.reference}.pdf`);
  };

  const handleShowCancelModal = (payment) => {
    if (payment.status === '01') { // Solo permitir cancelar pagos pendientes
      setSelectedPayment(payment);
      setShowCancelModal(true);
    }
  };

  const handleCancelPayment = async () => {
    if (!selectedPayment || !cancelReason.trim()) return;

    setIsProcessing(true);
    setCancelError(null);

    try {
      await cancelPayment(selectedPayment.reference, cancelReason);
      setShowCancelModal(false);
      setSelectedPayment(null);
      setCancelReason('');
    } catch (error) {
      console.error('Error al cancelar el pago:', error);
      setCancelError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = paymentsList.filter(payment => 
    payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="p-0">
      <div className="bg-light border-bottom py-4 px-4 mb-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/dashboard')}
              >
                <FaArrowLeft className="me-2" />
                Volver al Dashboard
              </Button>
              <h2 className="mb-0">Referencias de Pago</h2>
            </div>
            <div className="d-flex gap-3">
              <InputGroup style={{ width: '300px' }}>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por referencia o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button 
                variant="primary"
                onClick={() => navigate('/create-payment')}
              >
                <FaPlus className="me-2" />
                Nueva Referencia
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="px-4">
        <Card className="shadow-sm">
          <Card.Body>
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Referencia</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Fecha de Creación</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No se encontraron referencias de pago
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.reference}>
                        <td style={{ maxWidth: '200px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-truncate">{payment.reference}</span>
                            <Button
                              variant={copiedId === payment.reference ? "success" : "outline-secondary"}
                              size="sm"
                              onClick={() => handleCopyReference(payment.reference)}
                            >
                              {copiedId === payment.reference ? <FaCheck /> : <FaCopy />}
                            </Button>
                          </div>
                        </td>
                        <td style={{ maxWidth: '200px' }}>
                          <span className="text-truncate d-inline-block w-100">
                            {payment.description}
                          </span>
                        </td>
                        <td>{formatAmount(payment.amount)}</td>
                        <td>{getStatusBadge(payment.status)}</td>
                        <td>{formatDate(payment.creationDate)}</td>
                        <td>{formatDate(payment.dueDate)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/view-payment/${payment.reference}/${payment.paymentId}`)}
                            >
                              <FaEye className="me-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDownloadPDF(payment)}
                            >
                              <FaFilePdf className="me-1" />
                              PDF
                            </Button>
                            {payment.status === '01' && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleShowCancelModal(payment)}
                              >
                                <FaBan className="me-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal de Confirmación de Cancelación */}
      <Modal show={showCancelModal} onHide={() => {
        setShowCancelModal(false);
        setSelectedPayment(null);
        setCancelError(null);
        setCancelReason('');
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Referencia de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelError && (
            <Alert variant="danger" className="mb-3">
              {cancelError}
            </Alert>
          )}
          {selectedPayment && (
            <>
              <p>¿Está seguro que desea cancelar la siguiente referencia de pago?</p>
              <p><strong>Referencia:</strong> {selectedPayment.reference}</p>
              <p><strong>Monto:</strong> {formatAmount(selectedPayment.amount)}</p>
              <p><strong>Descripción:</strong> {selectedPayment.description}</p>
              <Form.Group className="mt-3">
                <Form.Label>Motivo de la cancelación</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ingrese el motivo de la cancelación"
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowCancelModal(false);
              setSelectedPayment(null);
              setCancelError(null);
              setCancelReason('');
            }}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelPayment}
            disabled={isProcessing || !cancelReason.trim()}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Procesando...
              </>
            ) : (
              'Confirmar Cancelación'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentList; 
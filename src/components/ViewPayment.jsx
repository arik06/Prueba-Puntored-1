import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaFilePdf, FaCopy, FaCheck, FaSync } from 'react-icons/fa';
import { PaymentContext } from '../context/PaymentContext';
import { generatePaymentPDF } from '../utils/pdfGenerator';

const ViewPayment = () => {
  const { reference, paymentId } = useParams();
  const navigate = useNavigate();
  const { getPaymentDetails } = useContext(PaymentContext);
  const [payment, setPayment] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPaymentDetails = async (forceRefresh = false) => {
    if (!reference || !paymentId) {
      setError('Referencia o ID de pago no válidos');
      return;
    }

    setIsLoading(!payment); // Solo mostrar loading si no hay datos previos
    setIsRefreshing(!!payment); // Mostrar refresh indicator si ya hay datos
    setError(null);

    try {
      const response = await getPaymentDetails(reference, paymentId);
      if (response?.data) {
        setPayment(response.data);
        setError(null);
      } else {
        setError('No se encontraron datos del pago');
      }
    } catch (err) {
      setError(err.message || 'Error al obtener los detalles del pago');
      console.error('Error al obtener detalles del pago:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [reference, paymentId]);

  const handleRefresh = () => {
    fetchPaymentDetails(true);
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

  const handleCopyReference = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const handleDownloadPDF = () => {
    if (payment) {
      const doc = generatePaymentPDF(payment);
      doc.save(`comprobante-${payment.reference}.pdf`);
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card className="p-4 text-center">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="mb-0">Cargando detalles del pago...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/dashboard')}
            >
              <FaArrowLeft className="me-2" />
              Volver al Dashboard
            </Button>
            <h3 className="mb-0">Detalles del Pago</h3>
            {payment && (
              <Button 
                variant="outline-primary"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <FaSync className={`me-2 ${isRefreshing ? 'fa-spin' : ''}`} />
                Actualizar
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  Volver al Dashboard
                </Button>
              </div>
            </Alert>
          )}

          {payment && !error && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h5 className="mb-3">Información de Referencia</h5>
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-2">
                          <strong>Referencia:</strong> {reference}
                        </div>
                        <Button 
                          variant={copied ? "success" : "outline-secondary"}
                          size="sm"
                          onClick={handleCopyReference}
                        >
                          {copied ? <FaCheck /> : <FaCopy />}
                        </Button>
                      </div>
                      <p><strong>Estado:</strong> {getStatusBadge(payment.status)}</p>
                      <p><strong>Monto:</strong> {formatAmount(payment.amount)}</p>
                      <p><strong>Descripción:</strong> {payment.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h5 className="mb-3">Fechas</h5>
                      <p><strong>Creación:</strong> {formatDate(payment.creationDate)}</p>
                      <p><strong>Vencimiento:</strong> {formatDate(payment.dueDate)}</p>
                      {payment.status === '02' && (
                        <p><strong>Fecha de Pago:</strong> {formatDate(payment.paymentDate)}</p>
                      )}
                      {payment.status === '03' && (
                        <>
                          <p><strong>Fecha de Cancelación:</strong> {formatDate(payment.updatedAt)}</p>
                          <p><strong>Motivo de Cancelación:</strong> {payment.cancelDescription}</p>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center">
                <Button 
                  variant="danger"
                  onClick={handleDownloadPDF}
                  className="me-2"
                >
                  <FaFilePdf className="me-2" />
                  Descargar Comprobante PDF
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ViewPayment; 
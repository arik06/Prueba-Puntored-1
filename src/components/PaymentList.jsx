import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Badge, Button, Form, InputGroup, Card, Modal, Alert, Row, Col, Dropdown } from 'react-bootstrap';
import { FaSearch, FaCopy, FaCheck, FaEye, FaArrowLeft, FaPlus, FaFilePdf, FaBan, FaFileExcel, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { PaymentContext } from '../context/PaymentContext';
import { generatePaymentPDF } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';
import logo from '../assets/logo.png';

const PaymentList = () => {
  const navigate = useNavigate();
  const { paymentsList, cancelPayment, error: contextError } = useContext(PaymentContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: ''
  });
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    if (!selectedPayment) return;

    setIsProcessing(true);
    setCancelError(null);

    try {
      await cancelPayment(selectedPayment.reference);
      setShowCancelModal(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error al cancelar el pago:', error);
      setCancelError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleExportToExcel = () => {
    const dataToExport = filteredPayments.map(payment => ({
      Referencia: payment.reference,
      Descripción: payment.description,
      Monto: payment.amount,
      Estado: getStatusText(payment.status),
      'Fecha de Creación': formatDate(payment.creationDate),
      'Fecha de Vencimiento': formatDate(payment.dueDate)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Referencias");
    XLSX.writeFile(wb, "referencias-de-pago.xlsx");
  };

  const getStatusText = (status) => {
    const statusMap = {
      '01': 'Pendiente',
      '02': 'Pagado',
      '03': 'Cancelado',
      '04': 'Expirado'
    };
    return statusMap[status] || 'Desconocido';
  };

  const handleSelectPayment = (reference) => {
    setSelectedPayments(prev => {
      if (prev.includes(reference)) {
        return prev.filter(ref => ref !== reference);
      } else {
        return [...prev, reference];
      }
    });
  };

  const handleSelectAllInPage = (event) => {
    if (event.target.checked) {
      const pagePayments = getCurrentPageItems().map(payment => payment.reference);
      setSelectedPayments(prev => [...new Set([...prev, ...pagePayments])]);
    } else {
      const pagePayments = getCurrentPageItems().map(payment => payment.reference);
      setSelectedPayments(prev => prev.filter(ref => !pagePayments.includes(ref)));
    }
  };

  const handleCancelSelected = () => {
    setSelectedPayment({ references: selectedPayments });
    setShowCancelModal(true);
  };

  const handleBulkCancelPayment = async () => {
    setIsProcessing(true);
    setCancelError(null);

    try {
      for (const reference of selectedPayment.references) {
        await cancelPayment(reference);
      }
      setShowCancelModal(false);
      setSelectedPayment(null);
      setSelectedPayments([]);
    } catch (error) {
      console.error('Error al cancelar pagos:', error);
      setCancelError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = paymentsList.filter(payment => {
    const matchesSearch = 
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateRange = 
      (!filters.startDate || new Date(payment.creationDate) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(payment.creationDate) <= new Date(filters.endDate));

    const matchesAmountRange =
      (!filters.minAmount || payment.amount >= parseFloat(filters.minAmount)) &&
      (!filters.maxAmount || payment.amount <= parseFloat(filters.maxAmount));

    const matchesStatus =
      !filters.status || payment.status === filters.status;

    return matchesSearch && matchesDateRange && matchesAmountRange && matchesStatus;
  });

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

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
              <img 
                src={logo}
                alt="Logo" 
                style={{ height: '40px', marginRight: '15px' }}
              />
              <h2 className="mb-0">Referencias de Pago</h2>
            </div>
            <div className="d-flex gap-3">
              <Button
                variant="outline-primary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-2" />
                Filtros
              </Button>
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
                variant="success"
                onClick={handleExportToExcel}
              >
                <FaFileExcel className="me-2" />
                Exportar Excel
              </Button>
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

      {showFilters && (
        <Container fluid className="px-4 mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha Inicial</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha Final</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monto Mínimo</Form.Label>
                    <Form.Control
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monto Máximo</Form.Label>
                    <Form.Control
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="01">Pendiente</option>
                      <option value="02">Pagado</option>
                      <option value="03">Cancelado</option>
                      <option value="04">Expirado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      )}

      <Container fluid className="px-4">
        <Card className="shadow-sm">
          <Card.Body>
            {selectedPayments.length > 0 && (
              <div className="mb-3">
                <Button
                  variant="warning"
                  onClick={handleCancelSelected}
                  disabled={!selectedPayments.some(ref => 
                    paymentsList.find(p => p.reference === ref)?.status === '01'
                  )}
                >
                  <FaBan className="me-2" />
                  Cancelar Seleccionados ({selectedPayments.length})
                </Button>
              </div>
            )}
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        onChange={handleSelectAllInPage}
                        checked={getCurrentPageItems().every(payment => 
                          selectedPayments.includes(payment.reference)
                        )}
                      />
                    </th>
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
                  {getCurrentPageItems().length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No se encontraron referencias de pago
                      </td>
                    </tr>
                  ) : (
                    getCurrentPageItems().map((payment) => (
                      <tr key={payment.reference}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedPayments.includes(payment.reference)}
                            onChange={() => handleSelectPayment(payment.reference)}
                          />
                        </td>
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
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPayments.length)} de {filteredPayments.length} referencias
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal de Confirmación de Cancelación */}
      <Modal show={showCancelModal} onHide={() => {
        setShowCancelModal(false);
        setSelectedPayment(null);
        setCancelError(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPayment?.references ? 'Cancelar Referencias Seleccionadas' : 'Cancelar Referencia de Pago'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelError && (
            <Alert variant="danger" className="mb-3">
              {cancelError}
            </Alert>
          )}
          {selectedPayment && (
            <>
              {selectedPayment.references ? (
                <>
                  <p>¿Está seguro que desea cancelar las siguientes referencias de pago?</p>
                  <ul>
                    {selectedPayment.references.map(ref => (
                      <li key={ref}>{ref}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p>¿Está seguro que desea cancelar la siguiente referencia de pago?</p>
                  <p><strong>Referencia:</strong> {selectedPayment.reference}</p>
                  <p><strong>Monto:</strong> {formatAmount(selectedPayment.amount)}</p>
                  <p><strong>Descripción:</strong> {selectedPayment.description}</p>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowCancelModal(false);
            setSelectedPayment(null);
            setCancelError(null);
          }}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={selectedPayment?.references ? handleBulkCancelPayment : handleCancelPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Cancelación'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentList; 
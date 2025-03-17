import React, { useState, useContext } from 'react';
import { PaymentContext } from '../context/PaymentContext';
import { Form, Button, Container, Card, Alert, InputGroup } from 'react-bootstrap';
import { FaCopy, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CreatePayment = () => {
  const navigate = useNavigate();
  const { loading, error, setError, createPayment } = useContext(PaymentContext);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reference, setReference] = useState(null);
  const [copied, setCopied] = useState(false);

  // Validaciones
  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return false;
    }

    if (!description.trim()) {
      setError('La descripción es requerida');
      return false;
    }

    if (!dueDate) {
      setError('La fecha de vencimiento es requerida');
      return false;
    }

    // Validar que la fecha no sea anterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    if (selectedDate < today) {
      setError('La fecha de vencimiento no puede ser anterior a hoy');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setReference(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await createPayment({
        externalId: `ext-${Date.now()}`,
        amount: parseFloat(amount),
        description,
        dueDate: `${dueDate} 23:59:59`,
        callbackURL: 'https://myurl/callback',
      });

      if (result?.data?.reference) {
        setReference(result.data.reference);
        // Limpiar el formulario después de crear exitosamente
        setAmount('');
        setDescription('');
        setDueDate('');
      }
    } catch (err) {
      // El error ya se maneja en el contexto
      console.error('Error en la creación del pago:', err);
    }
  };

  const handleCopyReference = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '30rem', padding: '20px' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <FaArrowLeft className="me-2" />
              Volver al Dashboard
            </Button>
            <h3 className="mb-0">Crear Referencia de Pago</h3>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {reference && (
            <Alert variant="success" className="mb-4">
              <p className="mb-2">¡Referencia creada exitosamente!</p>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={reference}
                  readOnly
                  className="bg-white"
                />
                <Button 
                  variant={copied ? "success" : "outline-secondary"}
                  onClick={handleCopyReference}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </Button>
              </InputGroup>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Monto *</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Ingrese el monto sin comas ni símbolos especiales
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Pago de servicio"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength="255"
                required
              />
              <Form.Text className="text-muted">
                Máximo 255 caracteres
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Fecha de vencimiento *</Form.Label>
              <Form.Control
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <Form.Text className="text-muted">
                La fecha debe ser igual o posterior a hoy
              </Form.Text>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Creando referencia...' : 'Crear Referencia de Pago'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreatePayment;

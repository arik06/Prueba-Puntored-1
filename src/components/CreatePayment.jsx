import React, { useState, useContext } from 'react';
import { PaymentContext } from '../context/PaymentContext';
import { Form, Button, Container, Card } from 'react-bootstrap';

const CreatePayment = () => {
  const { createPayment } = useContext(PaymentContext);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    createPayment({
      externalId: `ext-${Date.now()}`,
      amount: parseFloat(amount),
      description,
      dueDate: `${dueDate} 23:59:59`,
      callbackURL: 'https://myurl/callback',
    });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '25rem', padding: '20px' }}>
        <Card.Body>
          <h3 className="text-center">Crear Referencia</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese el monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de vencimiento</Form.Label>
              <Form.Control
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100">
              Crear Pago
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreatePayment;

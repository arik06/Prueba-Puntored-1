import React, { createContext, useState } from 'react';

// Crear el contexto
export const PaymentContext = createContext();

// Proveedor del contexto
export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authenticate = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.responseMessage || 'Error de autenticación');
      }

      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        return data;
      } else {
        throw new Error('Token no recibido');
      }
    } catch (error) {
      setError(error.message || 'Error en la autenticación');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          externalId: paymentData.externalId,
          amount: paymentData.amount,
          description: paymentData.description,
          dueDate: paymentData.dueDate,
          callbackURL: paymentData.callbackURL
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.responseMessage || 'Error al crear el pago');
      }

      return data;
    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message || 'Error al crear la referencia de pago');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    loading,
    error,
    setLoading,
    setError,
    authenticate,
    createPayment
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

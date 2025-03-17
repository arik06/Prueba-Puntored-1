import React, { createContext, useState, useCallback } from 'react';

// Crear el contexto
export const PaymentContext = createContext();

// Proveedor del contexto
export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentCache, setPaymentCache] = useState({});
  const [paymentsList, setPaymentsList] = useState(() => {
    const savedPayments = localStorage.getItem('paymentsList');
    return savedPayments ? JSON.parse(savedPayments) : [];
  });

  // Guardar la lista de pagos en localStorage cuando cambie
  const savePaymentsToStorage = (payments) => {
    localStorage.setItem('paymentsList', JSON.stringify(payments));
  };

  const addPaymentToList = useCallback((payment) => {
    setPaymentsList(prevList => {
      const newList = [payment, ...prevList];
      savePaymentsToStorage(newList);
      return newList;
    });
  }, []);

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

      // Agregar el nuevo pago al caché y a la lista
      if (data.data) {
        const cacheKey = `${data.data.reference}:${data.data.paymentId}`;
        setPaymentCache(prevCache => ({
          ...prevCache,
          [cacheKey]: {
            data: data.data,
            timestamp: Date.now()
          }
        }));

        // Agregar a la lista de pagos
        addPaymentToList({
          ...data.data,
          creationDate: new Date().toISOString(),
          status: '01' // Estado inicial: Pendiente
        });
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

  const getPaymentDetails = useCallback(async (reference, paymentId) => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si existe en caché y no ha expirado (30 minutos)
      const cacheKey = `${reference}:${paymentId}`;
      const cachedPayment = paymentCache[cacheKey];
      const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos

      if (cachedPayment && (Date.now() - cachedPayment.timestamp) < CACHE_DURATION) {
        setLoading(false);
        return { data: cachedPayment.data };
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/payment/${reference}/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.responseMessage || 'Error al obtener los detalles del pago');
      }

      // Guardar en caché
      if (data.data) {
        setPaymentCache(prevCache => ({
          ...prevCache,
          [cacheKey]: {
            data: data.data,
            timestamp: Date.now()
          }
        }));

        // Actualizar el estado en la lista de pagos si existe
        setPaymentsList(prevList => {
          const updatedList = prevList.map(payment => 
            payment.reference === reference ? { ...payment, ...data.data } : payment
          );
          savePaymentsToStorage(updatedList);
          return updatedList;
        });
      }

      return data;
    } catch (error) {
      setError(error.message || 'Error al obtener los detalles de la referencia');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [paymentCache]);

  const clearPaymentCache = useCallback(() => {
    setPaymentCache({});
  }, []);

  const cancelPayment = async (reference) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const payment = paymentsList.find(p => p.reference === reference);
      if (!payment) {
        throw new Error('Referencia de pago no encontrada');
      }

      const response = await fetch('/api/payment/cancel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reference: reference,
          status: '03',
          updateDescription: 'Cancelación solicitada por el usuario'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.responseMessage || 'Error al cancelar el pago');
      }

      // Actualizar el estado en la lista de pagos
      setPaymentsList(prevList => {
        const updatedList = prevList.map(p => 
          p.reference === reference 
            ? { 
                ...p, 
                status: '03',
                cancelDescription: 'Cancelación solicitada por el usuario',
                updatedAt: new Date().toISOString()
              } 
            : p
        );
        savePaymentsToStorage(updatedList);
        return updatedList;
      });

      // Actualizar el caché
      const cacheKey = `${reference}:${payment.paymentId}`;
      setPaymentCache(prevCache => ({
        ...prevCache,
        [cacheKey]: {
          data: {
            ...payment,
            status: '03',
            cancelDescription: 'Cancelación solicitada por el usuario',
            updatedAt: new Date().toISOString()
          },
          timestamp: Date.now()
        }
      }));

      return data;
    } catch (error) {
      console.error('Error al cancelar el pago:', error);
      setError(error.message || 'Error al cancelar la referencia de pago');
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
    createPayment,
    getPaymentDetails,
    clearPaymentCache,
    paymentsList,
    cancelPayment
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

import React, { createContext, useState, useCallback, useContext } from 'react';
import { toast } from 'react-toastify';

// Crear el contexto
export const PaymentContext = createContext();

export const usePayments = () => {
  return useContext(PaymentContext);
};

// Proveedor del contexto
export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentCache, setPaymentCache] = useState({});
  const [paymentsList, setPaymentsList] = useState(() => {
    const savedPayments = localStorage.getItem('payments');
    return savedPayments ? JSON.parse(savedPayments) : [];
  });

  // Guardar la lista de pagos en localStorage cuando cambie
  const savePaymentsToStorage = (payments) => {
    localStorage.setItem('payments', JSON.stringify(payments));
  };

  const addPayment = (payment) => {
    const newPayment = {
      ...payment,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString()
    };

    setPaymentsList(prev => {
      const updated = [newPayment, ...prev];
      savePaymentsToStorage(updated);
      return updated;
    });

    // Notificar creación de nueva referencia
    toast.success('Referencia creada exitosamente', {
      position: "top-right",
      autoClose: 5000,
    });

    // Emitir evento para el sistema de notificaciones
    const event = new CustomEvent('paymentStatusUpdate', {
      detail: {
        referenceId: payment.reference,
        status: 'PENDIENTE',
        message: `Nueva referencia creada: ${payment.reference}`
      }
    });
    window.dispatchEvent(event);
  };

  const updatePaymentStatus = (reference, newStatus) => {
    setPaymentsList(prev => {
      const updated = prev.map(payment => {
        if (payment.reference === reference) {
          const updatedPayment = {
            ...payment,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };

          // Emitir evento para el sistema de notificaciones
          const event = new CustomEvent('paymentStatusUpdate', {
            detail: {
              referenceId: reference,
              status: newStatus,
              message: `La referencia ${reference} ha cambiado a estado: ${newStatus}`
            }
          });
          window.dispatchEvent(event);

          // Mostrar toast según el estado
          switch (newStatus) {
            case 'PAGADO':
              toast.success(`Referencia ${reference} pagada exitosamente`);
              break;
            case 'CANCELADO':
              toast.warning(`Referencia ${reference} cancelada`);
              break;
            case 'PENDIENTE':
              toast.info(`Referencia ${reference} pendiente de pago`);
              break;
            default:
              toast.info(`Estado de referencia ${reference} actualizado`);
          }

          return updatedPayment;
        }
        return payment;
      });

      savePaymentsToStorage(updated);
      return updated;
    });
  };

  const getPaymentByReference = (reference) => {
    return paymentsList.find(payment => payment.reference === reference);
  };

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
        addPayment(data.data);
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
        updatePaymentStatus(reference, data.data.status);
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
      updatePaymentStatus(reference, '03');

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
    cancelPayment,
    addPayment,
    updatePaymentStatus,
    getPaymentByReference
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentProvider;

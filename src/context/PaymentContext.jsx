import React, { createContext, useState } from 'react';

// Crear el contexto
export const PaymentContext = createContext();

// Proveedor del contexto
export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contextValue = {
    loading,
    error,
    setLoading,
    setError
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

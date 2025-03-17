import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { PaymentProvider } from './context/PaymentContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PaymentProvider>
      <Router>
        <App />
      </Router>
    </PaymentProvider>
  </React.StrictMode>
);

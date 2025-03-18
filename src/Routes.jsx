import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreatePayment from './components/CreatePayment';
import ViewPayment from './components/ViewPayment';
import PaymentList from './components/PaymentList';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-payment" element={<CreatePayment />} />
      <Route path="/view-payment/:reference/:paymentId" element={<ViewPayment />} />
      <Route path="/payment-list" element={<PaymentList />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </RouterRoutes>
  );
};

export default Routes; 
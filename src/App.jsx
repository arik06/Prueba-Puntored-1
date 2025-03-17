import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreatePayment from './components/CreatePayment';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-payment" element={<CreatePayment />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

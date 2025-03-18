import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Routes from './Routes';

function App() {
  return (
    <NotificationProvider>
      <Routes />
      <ToastContainer />
    </NotificationProvider>
  );
}

export default App;

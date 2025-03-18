import React, { useContext, useMemo } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { PaymentContext } from '../context/PaymentContext';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardCharts = () => {
  const { paymentsList } = useContext(PaymentContext);

  // Calcular las métricas
  const metrics = useMemo(() => {
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    // Inicializar contadores por estado
    const statusCounts = {
      '01': 0, // Pendiente
      '02': 0, // Pagado
      '03': 0, // Cancelado
      '04': 0  // Expirado
    };

    // Inicializar datos mensuales
    const monthlyData = {
      labels: [],
      created: [],
      paid: [],
      cancelled: []
    };

    // Agrupar pagos por mes
    const monthlyPayments = {};

    paymentsList.forEach(payment => {
      // Contar por estado
      statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1;

      // Agrupar por mes
      const month = new Date(payment.creationDate).toLocaleString('es-ES', { month: 'long' });
      if (!monthlyPayments[month]) {
        monthlyPayments[month] = {
          created: 0,
          paid: 0,
          cancelled: 0
        };
      }
      monthlyPayments[month].created++;
      if (payment.status === '02') monthlyPayments[month].paid++;
      if (payment.status === '03') monthlyPayments[month].cancelled++;
    });

    // Convertir datos mensuales al formato necesario para la gráfica
    Object.entries(monthlyPayments).forEach(([month, data]) => {
      monthlyData.labels.push(month);
      monthlyData.created.push(data.created);
      monthlyData.paid.push(data.paid);
      monthlyData.cancelled.push(data.cancelled);
    });

    return {
      statusCounts,
      monthlyData
    };
  }, [paymentsList]);

  // Configuración de la gráfica de barras
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Referencias por Mes',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const barData = {
    labels: metrics.monthlyData.labels,
    datasets: [
      {
        label: 'Creadas',
        data: metrics.monthlyData.created,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Pagadas',
        data: metrics.monthlyData.paid,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Canceladas',
        data: metrics.monthlyData.cancelled,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Configuración de la gráfica circular
  const pieData = {
    labels: ['Pendientes', 'Pagadas', 'Canceladas', 'Expiradas'],
    datasets: [
      {
        data: [
          metrics.statusCounts['01'],
          metrics.statusCounts['02'],
          metrics.statusCounts['03'],
          metrics.statusCounts['04'],
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',  // Amarillo para pendientes
          'rgba(75, 192, 192, 0.5)',   // Verde para pagadas
          'rgba(255, 99, 132, 0.5)',   // Rojo para canceladas
          'rgba(201, 203, 207, 0.5)',  // Gris para expiradas
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Estado de Referencias',
      },
    },
  };

  return (
    <Row className="g-4 mb-4">
      <Col md={8}>
        <Card className="h-100">
          <Card.Body className="chart-container">
            <Bar options={barOptions} data={barData} />
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="h-100">
          <Card.Body className="chart-container">
            <Pie data={pieData} options={pieOptions} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardCharts; 
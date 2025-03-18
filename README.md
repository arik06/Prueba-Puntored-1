# 🚀 Sistema de Pagos Referenciados

Sistema moderno para la gestión de pagos referenciados, construido con React y tecnologías modernas.

## ✨ Características Principales

- 🔐 Autenticación segura con JWT
- 📱 Diseño responsive (móvil, tablet, escritorio)
- 📊 Gráficas interactivas con Chart.js
- 🔄 Sistema de reintentos automáticos
- 📨 Notificaciones en tiempo real
- 🎨 Interfaz moderna e intuitiva

## 🛠️ Tecnologías Utilizadas

- React 19.0.0
- React Router DOM 7.3.0
- React Bootstrap 2.10.9
- Axios
- Chart.js
- React Toastify
- Context API para manejo de estado

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Git

## 🚀 Instalación

1. **Clonar el repositorio**
   \`\`\`bash
   git clone [URL_DEL_REPOSITORIO]
   cd pagos-referenciados
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   # o
   yarn install
   \`\`\`

3. **Configurar variables de entorno**
   - Crear archivo .env basado en .env.example
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   - Configurar las variables necesarias:
   \`\`\`
   VITE_API_URL=http://tu-api-url
   \`\`\`

4. **Iniciar el proyecto**
   \`\`\`bash
   npm run dev
   # o
   yarn dev
   \`\`\`

## 🌟 Funcionalidades

### Autenticación
- Login seguro con JWT
- Manejo de sesiones
- Protección de rutas

### Gestión de Referencias
- Creación de referencias de pago
- Visualización detallada
- Cancelación de referencias
- Exportación a PDF y Excel

### Dashboard
- Gráficas interactivas
- Métricas en tiempo real
- Filtros avanzados

## 📱 Responsive Design

El sistema está optimizado para diferentes dispositivos:

- 📱 Móvil: < 576px
- 📱 Tablet: 577px - 991px
- 💻 Desktop: > 992px

## 🔄 Sistema de Reintentos

Implementación robusta para manejar errores del servidor:

- Máximo 3 reintentos
- Delay progresivo entre intentos
- Notificaciones al usuario
- Manejo específico de errores 5xx

## 📚 Estructura del Proyecto

\`\`\`
src/
├── components/     # Componentes React
├── context/       # Contextos de React
├── services/      # Servicios de API
├── styles/        # Estilos CSS
├── utils/         # Utilidades
└── App.jsx        # Componente principal
\`\`\`

## 📸 Capturas de Código Importantes

### Sistema de Reintentos (apiService.js)
\`\`\`javascript
// Configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Función para determinar si debemos reintentar
const shouldRetry = (error) => {
  const { response, config } = error;
  return (
    response?.status >= 500 &&
    (!config.retryCount || config.retryCount < MAX_RETRIES)
  );
};
\`\`\`

### Manejo de Estado (PaymentContext.jsx)
\`\`\`javascript
export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentsList, setPaymentsList] = useState(() => {
    const savedPayments = localStorage.getItem('payments');
    return savedPayments ? JSON.parse(savedPayments) : [];
  });
  // ...
};
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

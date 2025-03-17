import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

export const generatePaymentPDF = (payment) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Crear un elemento canvas temporal para el código de barras
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, payment.reference, {
    format: "CODE128",
    width: 1.5,
    height: 50,
    displayValue: true,
    fontSize: 12,
    margin: 5,
    background: "#ffffff",
    lineColor: "#000000",
    marginTop: 0,
    marginBottom: 0,
    textMargin: 2
  });

  // Configuración de la página
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  
  // Título
  doc.text('Comprobante de Pago', pageWidth / 2, 20, { align: 'center' });
  
  // Línea separadora después del título
  doc.setLineWidth(0.5);
  doc.line(20, 25, pageWidth - 20, 25);

  // Información del pago
  doc.setFontSize(11);
  
  // Columna izquierda
  doc.text('Referencia:', 20, 40);
  doc.setFont(undefined, 'bold');
  doc.text(payment.reference, 80, 40);
  doc.setFont(undefined, 'normal');
  
  doc.text('Estado:', 20, 50);
  const estado = {
    '01': 'Pendiente',
    '02': 'Pagado',
    '03': 'Cancelado',
    '04': 'Expirado'
  }[payment.status] || 'Desconocido';
  doc.setFont(undefined, 'bold');
  doc.text(estado, 80, 50);
  doc.setFont(undefined, 'normal');
  
  doc.text('Monto:', 20, 60);
  doc.setFont(undefined, 'bold');
  doc.text(new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(payment.amount), 80, 60);
  doc.setFont(undefined, 'normal');
  
  doc.text('Descripción:', 20, 70);
  doc.text(payment.description, 80, 70);
  
  doc.text('Fecha de Creación:', 20, 80);
  doc.text(new Date(payment.creationDate).toLocaleString('es-CO'), 80, 80);
  
  doc.text('Fecha de Vencimiento:', 20, 90);
  doc.text(new Date(payment.dueDate).toLocaleString('es-CO'), 80, 90);

  if (payment.status === '02') {
    doc.text('Fecha de Pago:', 20, 100);
    doc.text(new Date(payment.paymentDate).toLocaleString('es-CO'), 80, 100);
    doc.text('Número de Autorización:', 20, 110);
    doc.setFont(undefined, 'bold');
    doc.text(payment.authorizationNumber || 'N/A', 80, 110);
    doc.setFont(undefined, 'normal');
  }

  // Línea separadora antes del código de barras
  doc.setLineWidth(0.5);
  doc.line(20, 115, pageWidth - 20, 115);

  // Agregar el código de barras con dimensiones ajustadas
  const barcodeImage = canvas.toDataURL('image/png');
  const barcodeWidth = 120;
  const barcodeHeight = 40;
  const barcodeX = (pageWidth - barcodeWidth) / 2;
  doc.addImage(barcodeImage, 'PNG', barcodeX, 125, barcodeWidth, barcodeHeight);

  // Línea separadora antes del pie de página
  doc.setLineWidth(0.5);
  doc.line(20, 260, pageWidth - 20, 260);

  // Pie de página
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Este documento es un comprobante de pago.', pageWidth / 2, 270, { align: 'center' });
  doc.text('Por favor, conserve este documento para futuras referencias.', pageWidth / 2, 275, { align: 'center' });

  return doc;
}; 
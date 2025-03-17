import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

export const generatePaymentPDF = (payment) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Crear un elemento canvas temporal para el código de barras
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, payment.reference, {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 20,
    margin: 10
  });

  // Configuración de la página
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  
  // Título
  doc.text('Comprobante de Pago', pageWidth / 2, 20, { align: 'center' });
  
  // Información del pago
  doc.setFontSize(12);
  doc.text('Referencia:', 20, 40);
  doc.text(payment.reference, 80, 40);
  
  doc.text('Estado:', 20, 50);
  const estado = {
    '01': 'Pendiente',
    '02': 'Pagado',
    '03': 'Cancelado',
    '04': 'Expirado'
  }[payment.status] || 'Desconocido';
  doc.text(estado, 80, 50);
  
  doc.text('Monto:', 20, 60);
  doc.text(new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(payment.amount), 80, 60);
  
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
    doc.text(payment.authorizationNumber || 'N/A', 80, 110);
  }

  // Agregar el código de barras
  const barcodeImage = canvas.toDataURL('image/png');
  doc.addImage(barcodeImage, 'PNG', 20, 120, 170, 60);

  // Pie de página
  doc.setFontSize(10);
  doc.text('Este documento es un comprobante de pago.', pageWidth / 2, 270, { align: 'center' });
  doc.text('Por favor, conserve este documento para futuras referencias.', pageWidth / 2, 275, { align: 'center' });

  return doc;
}; 
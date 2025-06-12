import StripePaymentService from '../services/stripeService.js';

const stripeService = new StripePaymentService();

export const handleStripeWebhook = async (req, res) => {
  let event;

  try {
    const signature = req.headers['stripe-signature'];
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error('Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Pago exitoso:', paymentIntent.id);
      
      // Aquí puedes actualizar tu base de datos, enviar emails, etc.
      await handleSuccessfulPayment(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Pago fallido:', failedPayment.id);
      
      await handleFailedPayment(failedPayment);
      break;

    case 'payment_intent.canceled':
      const canceledPayment = event.data.object;
      console.log('🚫 Pago cancelado:', canceledPayment.id);
      
      await handleCanceledPayment(canceledPayment);
      break;

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
};

// Funciones auxiliares para manejar cada tipo de evento
async function handleSuccessfulPayment(paymentIntent) {
  try {
    // Aquí implementarías tu lógica de negocio:
    // - Actualizar estado del pedido en la base de datos
    // - Enviar email de confirmación
    // - Activar servicios
    // - etc.
    
    console.log(`Procesando pago exitoso: ${paymentIntent.id}`);
    console.log(`Monto: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
    console.log(`Cliente: ${paymentIntent.customer}`);
    
    // Ejemplo de lo que podrías hacer:
    // await updateOrderStatus(paymentIntent.metadata.order_id, 'paid');
    // await sendConfirmationEmail(paymentIntent.customer);
    
  } catch (error) {
    console.error('Error procesando pago exitoso:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  try {
    console.log(`Procesando pago fallido: ${paymentIntent.id}`);
    console.log(`Razón: ${paymentIntent.last_payment_error?.message || 'Desconocida'}`);
    
    // Aquí podrías:
    // - Notificar al usuario
    // - Actualizar estado del pedido
    // - Enviar email de error
    
  } catch (error) {
    console.error('Error procesando pago fallido:', error);
  }
}

async function handleCanceledPayment(paymentIntent) {
  try {
    console.log(`Procesando pago cancelado: ${paymentIntent.id}`);
    
    // Aquí podrías:
    // - Liberar inventario
    // - Actualizar estado del pedido
    // - Notificar al usuario
    
  } catch (error) {
    console.error('Error procesando pago cancelado:', error);
  }
}
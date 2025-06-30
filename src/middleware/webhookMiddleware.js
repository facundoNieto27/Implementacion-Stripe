import StripePaymentService from '../services/stripeService.js';
import EmailService from '../services/emailService.js';

const stripeService = new StripePaymentService();
const emailService = new EmailService();

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

async function handleSuccessfulPayment(paymentIntent) {
    try {
        console.log(`Procesando pago exitoso: ${paymentIntent.id}`);
        console.log(`Monto: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
        console.log(`Cliente: ${paymentIntent.customer}`);

        // Obtener información del cliente
        const customer = await stripeService.stripe.customers.retrieve(paymentIntent.customer);
        
        // Enviar email de confirmación
        await emailService.sendPaymentConfirmation(
            customer.email,
            customer.name,
            {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            }
        );

        console.log('✅ Email de confirmación enviado a:', customer.email);

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
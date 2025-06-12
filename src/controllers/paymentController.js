import StripePaymentService from '../services/stripeService.js';

const stripeService = new StripePaymentService();

export const processPayment = async (req, res) => {
  try {
    const { customerData, paymentMethodToken, paymentData } = req.body;

    // Validar datos requeridos
    if (!customerData?.email || !customerData?.name || !paymentMethodToken) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: email, name y paymentMethodToken'
      });
    }

    // 1. Crear cliente
    const customer = await stripeService.createCustomer(
      customerData.email, 
      customerData.name
    );
    
    // 2. Crear método de pago
    const paymentMethod = await stripeService.createPaymentMethod(
      customer.id, 
      paymentMethodToken
    );
    
    // 3. Crear PaymentIntent
    const paymentIntent = await stripeService.createPaymentIntent(
      paymentMethod.id, 
      customer.id, 
      paymentData
    );

    res.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('Error procesando pago:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const paymentSuccess = (req, res) => {
  const { payment_intent } = req.query;
  
  if (!payment_intent) {
    return res.redirect('/?status=error&message=Pago inválido');
  }

  // Aquí podrías validar el estado del pago con Stripe si quieres
  res.redirect(`/?status=success&payment_intent=${payment_intent}`);
};

export const paymentCancel = (req, res) => {
  res.redirect('/?status=cancelled&message=Pago cancelado por el usuario');
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);
    
    res.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
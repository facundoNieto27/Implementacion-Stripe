import express from 'express';
import { 
  processPayment, 
  paymentSuccess, 
  paymentCancel, 
  getPaymentStatus 
} from '../controllers/paymentController.js';
import { handleStripeWebhook } from '../middleware/webhookMiddleware.js';

const router = express.Router();

// Endpoint para procesar pagos
router.post('/process', processPayment);

// Endpoints de redirección después del pago
router.get('/success', paymentSuccess);
router.get('/cancel', paymentCancel);

// Endpoint para consultar estado de un pago
router.get('/status/:paymentIntentId', getPaymentStatus);

// Webhook de Stripe (debe usar raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
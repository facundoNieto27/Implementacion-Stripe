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

// Webhook de Stripe - SIN express.raw() aquí porque ya está en app.js
router.post('/webhook', handleStripeWebhook);

export default router;
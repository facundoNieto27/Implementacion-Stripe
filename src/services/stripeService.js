import Stripe from "stripe";
import { configDotenv } from 'dotenv';

class StripePaymentService {
  constructor() {
    configDotenv();
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  _validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
  }

  _validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName} es requerido`);
    }
  }

  async createCustomer(email, name) {
    try {
      this._validateEmail(email);
      this._validateRequired(name, 'Nombre');

      const customer = await this.stripe.customers.create({
        email: email.trim(),
        name: name.trim(),
      });

      return customer;
    } catch (error) {
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  async createPaymentMethod(customerId, paymentMethodToken) {
    try {
      this._validateRequired(customerId, 'ID del cliente');
      this._validateRequired(paymentMethodToken, 'Token del método de pago');

      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: { token: paymentMethodToken },
      });

      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });

      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      return paymentMethod;
    } catch (error) {
      throw new Error(`Error al crear método de pago: ${error.message}`);
    }
  }

  async createPaymentIntent(paymentMethodId, customerId, paymentData = {}) {
    try {
      this._validateRequired(paymentMethodId, 'ID del método de pago');
      this._validateRequired(customerId, 'ID del cliente');

      const {
        amount = 3000,
        currency = 'usd',
        description = 'Pago procesado',
        metadata = {}
      } = paymentData;

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        description,
        metadata,
        payment_method: paymentMethodId,
        customer: customerId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });

      return paymentIntent;
    } catch (error) {
      throw new Error(`Error al procesar pago: ${error.message}`);
    }
  }

  // Método para verificar el estado de un PaymentIntent
  async getPaymentIntent(paymentIntentId) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new Error(`Error al obtener PaymentIntent: ${error.message}`);
    }
  }

  // Método para construir el evento del webhook
  constructWebhookEvent(payload, signature) {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      throw new Error(`Error verificando webhook: ${error.message}`);
    }
  }
}

export default StripePaymentService;
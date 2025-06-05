import { configDotenv } from "dotenv";
import Stripe from "stripe";


configDotenv();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



const createPaymentMethod = async (customerId, paymentMethodToken) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: paymentMethodToken },
    });
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
    console.log("Payment method created and attached to customer:", paymentMethod.id);
    // Return the created payment method
    return paymentMethod;
  }
  catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
  }
}

const createPayment = async (paymentMethodId, customerId) => { 
  try {
    await stripe.paymentIntents.create({
      amount: 3000,
      currency: "usd",
      description: "Payment for order #12345",
      metadata: { order_id: "12345" },
      payment_method: paymentMethodId,
      customer: customerId, 
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  } 
}

const createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });
    console.log(customer.name, "Customer created:", customer.id);
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

//asociar metodo de pago a un usuario

// (async () => {
//   try {
//     const customerId = "cus_SRKvWd8lDHBOGn"; // Replace with your customer ID
//     const paymentMethodId = "pm_1N4z2e2eZvKYlo2C0d3f5g7H"; // Replace with your payment method ID
//     await addPaymentMethodToCustomer(customerId, paymentMethodId);
//     console.log("Payment method added to customer successfully");
//   } catch (error) {
//     console.error("Error adding payment method to customer:", error);
//   }
// })();

const addPaymentMethodToCustomer = async (customerId, paymentMethodId) => {
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    console.log("Payment method added to customer:", paymentMethodId);
  } catch (error) {
    console.error("Error adding payment method to customer:", error);
    throw error;
  }
}

// prueba de crear un pago con un cliente y un metodo de pago

// Crear un cliente, un método de pago y un pago
(async () => {
  try {
    // Crear un cliente
    const customer = await createCustomer("juanm@gmail.com", "Juan");

    // Crear y asociar un método de pago al cliente
    const paymentMethod = await createPaymentMethod(customer.id, "tok_visa");

    // (Opcional) Asociar explícitamente el método de pago al cliente
    await addPaymentMethodToCustomer(customer.id, paymentMethod.id);

    // Crear un pago
    await createPayment(paymentMethod.id, customer.id);

    console.log("Payment created successfully");
  } catch (error) {
    console.error("Error:", error);
  }
})();
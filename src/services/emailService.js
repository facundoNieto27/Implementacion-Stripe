import sgMail from '@sendgrid/mail';
import { configDotenv } from 'dotenv';

class EmailService {
    constructor() {
        configDotenv();
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.fromEmail = process.env.FROM_EMAIL;
        this.fromName = process.env.FROM_NAME;
    }

    // Método principal para enviar correos
    async sendEmail(to, subject, htmlContent, textContent = '') {
        try {
            const msg = {
                to,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject,
                text: textContent,
                html: htmlContent,
            };

            const response = await sgMail.send(msg);
            console.log('✅ Email enviado exitosamente a:', to);
            return response;
        } catch (error) {
            console.error('❌ Error enviando email:', error.message);
            throw new Error(`Error al enviar email: ${error.message}`);
        }
    }

    // Template específico para confirmación de pago
    generatePaymentConfirmationHTML(customerName, paymentDetails) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Confirmación de Pago</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; }
                .success-icon { font-size: 48px; color: #4CAF50; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✅</div>
                    <h1>¡Pago Confirmado!</h1>
                </div>
                
                <div class="content">
                    <h2>Hola ${customerName},</h2>
                    <p>¡Gracias por tu compra! Hemos recibido tu pago exitosamente.</p>
                    
                    <div class="details">
                        <h3>Detalles del Pago:</h3>
                        <p><strong>ID de Transacción:</strong> ${paymentDetails.id}</p>
                        <p><strong>Monto:</strong> $${(paymentDetails.amount / 100).toFixed(2)} ${paymentDetails.currency.toUpperCase()}</p>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                        <p><strong>Estado:</strong> Pagado ✅</p>
                    </div>
                    
                    <p>Tu pedido será procesado en las próximas 24 horas. Te mantendremos informado sobre el estado de tu envío.</p>
                    
                    <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.</p>
                    
                    <p>¡Gracias por confiar en nosotros!</p>
                </div>
                
                <div class="footer">
                    <p>Este es un correo automático, por favor no respondas a esta dirección.</p>
                    <p>© 2025 Tu Empresa. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Método específico para enviar confirmación de pago
    async sendPaymentConfirmation(customerEmail, customerName, paymentDetails) {
        try {
            const subject = `Confirmación de Pago - Pedido #${paymentDetails.id.slice(-8)}`;
            const htmlContent = this.generatePaymentConfirmationHTML(customerName, paymentDetails);
            const textContent = `
Hola ${customerName},

¡Gracias por tu compra! Hemos recibido tu pago exitosamente.

Detalles del Pago:
- ID: ${paymentDetails.id}
- Monto: $${(paymentDetails.amount / 100).toFixed(2)} ${paymentDetails.currency.toUpperCase()}
- Fecha: ${new Date().toLocaleString('es-ES')}

Tu pedido será procesado en las próximas 24 horas.

¡Gracias por confiar en nosotros!
            `;

            return await this.sendEmail(customerEmail, subject, htmlContent, textContent);
        } catch (error) {
            console.error('Error enviando confirmación de pago:', error);
            throw error;
        }
    }
}

export default EmailService;
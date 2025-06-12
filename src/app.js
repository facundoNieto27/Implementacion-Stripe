import express from 'express';
import { configDotenv } from 'dotenv';
import paymentRoutes from './routes/paymentRoutes.js';

configDotenv();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANTE: El middleware raw para webhook debe ir ANTES de express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware para parsear JSON (para todas las demás rutas)
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
app.use('/api/payments', paymentRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log('Webhook URL: http://localhost:3000/api/payments/webhook');
});
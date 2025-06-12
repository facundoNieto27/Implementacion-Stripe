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

// Middleware para parsear JSON (excepto para webhook)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Servir archivos estáticos (tu frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
app.use('/api/payments', paymentRoutes);

// Ruta principal que sirve tu frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
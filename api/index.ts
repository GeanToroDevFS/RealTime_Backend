/**
 * Main server entrypoint for the RealTime backend.
 *
 * This module:
 *  - Loads environment variables via dotenv.
 *  - Creates and configures an Express application.
 *  - Applies global middleware (CORS, JSON body parser).
 *  - Mounts API routes (authRoutes) under /api.
 *  - Exposes simple health and debug endpoints.
 *  - Installs a top-level error handler.
 *  - Starts the HTTP server on the configured PORT.
 *
 * Environment variables used:
 *  - PORT (optional)        : Port to listen on (defaults to 3000)
 *  - NODE_ENV               : Environment name used in /debug response
 *  - FIREBASE_PROJECT_ID    : Presence reported in /debug
 *  - BREVO_API_KEY          : Presence reported in /debug
 *  - FRONTEND_URL           : Used by other modules (reported in /debug as needed)
 *
 * Note: This file intentionally does not export the `app` instance; if tests or external
 * modules need access to the Express app, consider exporting it and starting the listener
 * from a separate script.
 */
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import corsMiddleware from './middlewares/cors';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
/**
 * Apply CORS and JSON body parsing middleware to all incoming requests.
 *
 * - corsMiddleware: Configured CORS instance that validates origins against a whitelist.
 * - express.json(): Parses JSON request bodies and populates req.body.
 */
app.use(corsMiddleware);
app.use(express.json());

// Routes
/**
 * Mount API routes.
 *
 * Primary: expose under the "/api" prefix.
 * Compatibility: also mount at root to accept clients calling without "/api".
 * Examples:
 *  - POST /api/login  and  POST /login
 *  - GET  /api/profile and  GET /profile
 */
app.use('/api', authRoutes);
app.use('/', authRoutes);

// Health check
/**
 * Health check endpoint.
 *
 * A lightweight endpoint useful for load balancers, uptime checks and quick sanity checks.
 * Responds with a simple text confirming the backend is running.
 *
 * GET /
 * Responses:
 *  - 200: Plain text message indicating the server is running.
 */
app.get('/', (req, res) => {
  console.log('🚀 [HEALTH] Solicitud de health check');
  res.send('🚀 Backend RealTime funcionando correctamente.');
});

// Debug endpoint
/**
 * Debug endpoint exposing basic runtime configuration information.
 *
 * Returns a small JSON object with the current NODE_ENV, presence of required integrations
 * (Firebase and Brevo), and the listening port. This should never expose secrets and is
 * intended for development/debugging only.
 *
 * GET /debug
 * Responses:
 *  - 200: JSON diagnostic information
 */
app.get('/debug', (req, res) => {
  console.log('🔍 [DEBUG] Solicitud de información de debug');
  res.json({
    environment: process.env.NODE_ENV,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ No configurado',
    brevoKey: process.env.BREVO_API_KEY ? '✅ Configurado' : '❌ No configurado',
    port: PORT
  });
});

// Error handling
/**
 * Global error handling middleware.
 *
 * Catches errors passed down the middleware chain and returns a generic 500 response.
 * Logs the error message to the console. Keep this middleware last (after routes).
 *
 * @param {any} err - The error object.
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @param {express.NextFunction} next - Express next function (unused).
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 [ERROR] Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

/**
 * Start the HTTP server.
 *
 * The server listens on PORT and logs startup information including the debug URL.
 */
app.listen(PORT, () => {
  console.log(`🌐 [STARTUP] Servidor corriendo en puerto ${PORT}`);
  console.log(`🔍 [STARTUP] Debug disponible en: http://localhost:${PORT}/debug`);
});
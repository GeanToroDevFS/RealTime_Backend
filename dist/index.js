"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("./middlewares/cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));

/**
 * @module Server
 * @description Main entry point for the Express.js server application.
 * This module configures and starts the server, loading environment variables,
 * setting up middleware (CORS and JSON parsing), defining routes, and handling
 * errors. It includes health check and debug endpoints for monitoring.
 * 
 * Environment variables used:
 * - `PORT`: The port on which the server listens (defaults to 3000).
 * - `NODE_ENV`: The current environment (e.g., 'development', 'production').
 * - `FIREBASE_PROJECT_ID`: Firebase project ID for debug info.
 * - `BREVO_API_KEY`: Brevo API key for debug info.
 * 
 * The server listens on the specified port and logs startup information.
 * 
 * @requires dotenv
 * @requires express
 * @requires ./middlewares/cors
 * @requires ./routes/authRoutes
 * 
 * @example
 * // This file is typically run directly with Node.js:
 * // node server.js
 */
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(cors_1.default);
app.use(express_1.default.json());
app.use('/api', authRoutes_1.default);
app.use('/', authRoutes_1.default);

/**
 * Health check endpoint.
 * Responds with a message indicating the server is running.
 * 
 * @route GET /
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Sends a plain text response.
 */
app.get('/', (req, res) => {
    console.log('🚀 [HEALTH] Solicitud de health check');
    res.send('🚀 Backend RealTime funcionando correctamente.');
});

/**
 * Debug information endpoint.
 * Provides server configuration details for debugging purposes.
 * 
 * @route GET /debug
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Sends a JSON response with debug info.
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

/**
 * Global error handling middleware.
 * Catches unhandled errors and responds with a 500 status and error message.
 * 
 * @param {Error} err - The error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware function (not used).
 * @returns {void} Sends a JSON error response.
 */
app.use((err, req, res, next) => {
    console.error('💥 [ERROR] Error no manejado:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});
app.listen(PORT, () => {
    console.log(`🌐 [STARTUP] Servidor corriendo en puerto ${PORT}`);
    console.log(`🔍 [STARTUP] Debug disponible en: http://localhost:${PORT}/debug`);
});

"use strict";

/**
 * @module Server
 * @description Main entry point for the Express.js server application.
 * Loads environment variables, sets up Express app with CORS, JSON parsing, authentication routes,
 * health check and debug endpoints, global error handling, and starts the server on the specified port.
 * 
 * @requires dotenv
 * @requires express
 * @requires ./middlewares/cors
 * @requires ./routes/authRoutes
 */

// Polyfill for importing default exports in ES modules.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));

// Load environment variables from .env file.
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("./middlewares/cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));

/**
 * @description Creates the Express application instance.
 * @type {express.Application}
 */
const app = (0, express_1.default)();

/**
 * @description The port on which the server will listen, defaulting to 3000 if not specified in environment variables.
 * @type {string|number}
 */
const PORT = process.env.PORT || 3000;

// Apply CORS middleware to handle cross-origin requests.
app.use(cors_1.default);

// Parse incoming JSON requests.
app.use(express_1.default.json());

// Mount authentication routes under /api.
app.use('/api', authRoutes_1.default);

// Mount authentication routes under root (/) for compatibility.
app.use('/', authRoutes_1.default);

/**
 * @route GET /
 * @description Health check endpoint to verify the server is running.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Sends a simple success message.
 */
app.get('/', (req, res) => {
    console.log('🚀 [HEALTH] Solicitud de health check');
    res.send('🚀 Backend RealTime funcionando correctamente.');
});

/**
 * @route GET /debug
 * @description Debug endpoint providing server configuration information.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Responds with JSON containing environment details.
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
 * @description Global error handling middleware.
 * Catches unhandled errors, logs them, and responds with a 500 error.
 * @param {Error} err - The error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function (not used here).
 * @returns {void} Sends a JSON error response.
 */
app.use((err, req, res, next) => {
    console.error('💥 [ERROR] Error no manejado:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Start the server and log startup information.
app.listen(PORT, () => {
    console.log(`🌐 [STARTUP] Servidor corriendo en puerto ${PORT}`);
    console.log(`🔍 [STARTUP] Debug disponible en: http://localhost:${PORT}/debug`);
});

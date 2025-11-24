"use strict";

/**
 * @module CorsMiddleware
 * @description Configures and exports a CORS middleware for Express.js applications.
 * Allows cross-origin requests from specified origins (e.g., localhost and frontend URLs),
 * enables credentials, and defines allowed HTTP methods and headers.
 * 
 * @requires cors
 */

// Polyfill for importing default exports in ES modules.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));

/**
 * @function corsMiddleware
 * @description Middleware function to handle CORS requests.
 * Dynamically checks the origin against a list of allowed origins and allows the request if it matches.
 * Supports credentials and specifies allowed methods and headers.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {void} Proceeds to the next middleware or sends an error if origin is not allowed.
 */
const corsMiddleware = (0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.FRONTEND_URL || 'https://frontend-real-time.vercel.app',
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`🚫 [CORS] Origen no permitido: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
exports.default = corsMiddleware;

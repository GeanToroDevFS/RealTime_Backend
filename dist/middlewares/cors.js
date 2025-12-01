"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));

/**
 * @module CorsMiddleware
 * @description Configures and exports a CORS middleware for Express.js applications.
 * This middleware allows cross-origin requests from specified origins, enabling credentials,
 * and restricting methods and headers for security. It dynamically checks the request origin
 * against a list of allowed origins, including local development URLs and a configurable
 * frontend URL from environment variables.
 * 
 * Environment variables:
 * - `FRONTEND_URL`: Optional URL for the production frontend (defaults to 'https://frontend-real-time.vercel.app').
 * 
 * If the origin is not allowed, it logs a warning and rejects the request with a CORS error.
 * 
 * @requires cors
 * 
 * @example
 * // Usage in an Express app:
 * const corsMiddleware = require('./corsMiddleware');
 * app.use(corsMiddleware);
 */

/**
 * CORS middleware instance configured with custom options.
 * 
 * @type {Function}
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
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

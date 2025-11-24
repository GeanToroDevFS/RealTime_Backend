"use strict";

/**
 * @module AuthMiddleware
 * @description Middleware for authenticating JWT tokens in Express.js applications.
 * Verifies the presence and validity of a Bearer token in the Authorization header,
 * decodes it, and attaches the user payload to the request object.
 * 
 * @requires jsonwebtoken
 */

// Polyfill for importing default exports in ES modules.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));

/**
 * @module AuthMiddleware
 * @description Middleware for authenticating JWT tokens in Express.js applications.
 * Verifies the presence and validity of a Bearer token in the Authorization header,
 * decodes it, and attaches the user payload to the request object.
 * 
 * @requires jsonwebtoken
 */
// Polyfill for importing default exports in ES modules.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.warn('⚠️ [AUTH] Token no proporcionado');
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('❌ [AUTH] Token inválido:', err.message);
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;

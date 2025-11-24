import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * JWT authentication middleware.
 *
 * This middleware expects an Authorization header in the form: "Bearer <token>".
 * It verifies the token using the secret stored in process.env.JWT_SECRET. If the token
 * is valid, the decoded token payload is attached to req.user and next() is called.
 * If no token is provided, a 401 response is returned. If the token is invalid or verification
 * fails, a 403 response is returned.
 *
 * Side effects:
 *  - Logs warnings/errors to the console for missing or invalid tokens.
 *  - May send an HTTP response (401 or 403) and terminate the request chain.
 *
 * Usage:
 *  app.get('/protected', authenticateToken, (req, res) => {
 *    // req.user will contain the decoded token payload
 *  });
 *
 * @param {Request} req - Express request object. The middleware will read the Authorization header.
 * @param {Response} res - Express response object. Used to send 401/403 responses on failure.
 * @param {NextFunction} next - Express next function. Called when authentication succeeds.
 * @returns {void} - On success calls next(); on failure sends an HTTP error response.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('⚠️ [AUTH] Token no proporcionado');
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      console.error('❌ [AUTH] Token inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }

    (req as any).user = user;
    next();
  });
};
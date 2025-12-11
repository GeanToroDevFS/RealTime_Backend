/**
 * CORS middleware configuration.
 *
 * This middleware uses the `cors` package to apply dynamic origin validation
 * against a whitelist. The whitelist includes common local development origins
 * and a production FRONTEND_URL provided via environment variable.
 *
 * Behavior:
 *  - If the incoming request has no Origin header (e.g. server-to-server or same-origin requests),
 *    the request is allowed.
 *  - If the Origin header is present and matches an entry in the allowed origins list,
 *    the request is allowed.
 *  - If the Origin header is present and not in the allowed list, a warning is logged and
 *    the CORS callback is invoked with an Error('Not allowed by CORS'), causing the request
 *    to be rejected by the CORS middleware.
 *
 * Options applied:
 *  - origin: dynamic check using allowedOrigins array (includes FRONTEND_URL env or default)
 *  - credentials: true
 *  - methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
 *  - allowedHeaders: ['Content-Type', 'Authorization']
 *
 * Usage:
 *  import corsMiddleware from './api/middleware/cors';
 *  app.use(corsMiddleware);
 *
 * Notes:
 *  - Ensure process.env.FRONTEND_URL is set in production; otherwise the fallback URL
 *    'https://tu-frontend-realtime.vercel.app' will be used in the whitelist.
 *  - The middleware logs a warning when an origin is rejected.
 *
 * @constant {import('cors').CorsOptions} corsMiddleware - Preconfigured CORS middleware instance.
 */

import cors from "cors";
import type { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allowed?: boolean) => void
  ) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL || "https://frontend-real-time.vercel.app",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 [CORS] Origen no permitido: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * Middleware CORS con todas las opciones aplicadas.
 */
const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
export { corsOptions };

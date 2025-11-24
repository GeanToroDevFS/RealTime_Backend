/**
 * Auth routes module.
 *
 * Exposes authentication-related HTTP routes for registering, logging in (email & social),
 * password recovery, and profile management. Public routes do not require authentication,
 * while profile routes are protected by the authenticateToken middleware.
 *
 * Routes:
 *  - POST /register         : Register a new user (public)
 *  - POST /login            : Login with email/password (public)
 *  - POST /login-social     : Login using social provider idToken (public)
 *  - POST /forgot-password  : Start password recovery flow (public)
 *  - POST /reset-password   : Reset password with recovery token (public)
 *  - GET  /profile          : Get authenticated user's profile (protected)
 *  - PUT  /profile          : Update authenticated user's profile (protected)
 *
 * Note: Controller methods return responses directly; this router wires controller methods
 * to express routes. Protected routes expect authenticateToken middleware to attach
 * decoded token payload to req.user (i.e. (req as any).user).
 */
import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();
const authController = new AuthController();

// Public routes

/**
 * POST /register
 *
 * Public route.
 * Registers a new user using AuthController.register.
 *
 * Expected body:
 *  - name: string
 *  - lastname: string
 *  - email: string
 *  - password: string
 *  - birthdate: string (ISO date)
 *
 * Responses:
 *  - 201: User created (returns created user data)
 *  - 400: Missing/invalid fields
 *  - 500: Server error
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * POST /login
 *
 * Public route.
 * Logs a user in using AuthController.login. In this implementation the endpoint
 * issues a server JWT for an existing Firebase user.
 *
 * Expected body:
 *  - email: string
 *  - password: string
 *
 * Responses:
 *  - 200: Returns token and user info
 *  - 400: Missing fields
 *  - 404: User not found
 *  - 500: Server error
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * POST /login-social
 *
 * Public route.
 * Social login using a Firebase idToken. Verifies the idToken and creates a Firestore
 * user if needed, then returns a server JWT.
 *
 * Expected body:
 *  - idToken: string (Firebase ID token)
 *  - provider: string ('google' | 'facebook' | 'github' | etc.)
 *
 * Responses:
 *  - 200: Returns token and user info
 *  - 400: Missing fields
 *  - 500: Server error
 */
router.post('/login-social', (req, res) => authController.loginSocial(req, res));

/**
 * POST /forgot-password
 *
 * Public route.
 * Starts password recovery by generating a short-lived token and sending a recovery email.
 *
 * Expected body:
 *  - email: string
 *
 * Responses:
 *  - 200: Email sent (instructions)
 *  - 400: Missing email
 *  - 500: Server error
 */
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));

/**
 * POST /reset-password
 *
 * Public route.
 * Resets the user's password using a previously issued recovery token.
 *
 * Expected body:
 *  - token: string
 *  - newPassword: string
 *
 * Responses:
 *  - 200: Password reset successfully
 *  - 400: Missing fields
 *  - 500: Server error
 */
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

// Protected routes
/**
 * GET /profile
 *
 * Protected route.
 * Returns the authenticated user's profile. Requires authenticateToken middleware.
 *
 * Responses:
 *  - 200: Returns user profile
 *  - 401: Unauthorized (no token)
 *  - 404: User not found
 *  - 500: Server error
 */
router.get('/profile', authenticateToken, (req, res) => authController.getProfile(req, res));

/**
 * PUT /profile
 *
 * Protected route.
 * Updates the authenticated user's profile. Requires authenticateToken middleware.
 *
 * Expected body (any subset):
 *  - name?: string
 *  - lastname?: string
 *  - email?: string
 *  - birthdate?: string (ISO date)
 *
 * Responses:
 *  - 200: Profile updated (returns updated user)
 *  - 401: Unauthorized (no token)
 *  - 500: Server error
 */
router.put('/profile', authenticateToken, (req, res) => authController.updateProfile(req, res));


router.delete('/profile', authenticateToken, (req, res) => authController.deleteMe(req, res));

export default router;
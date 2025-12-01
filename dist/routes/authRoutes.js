"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");

/**
 * @module AuthRouter
 * @description Express router for handling authentication-related routes.
 * This module sets up routes for user registration, login (standard and social), 
 * password recovery, profile management, and account deletion. Protected routes 
 * use JWT authentication middleware. It instantiates an AuthController to handle 
 * the business logic for each endpoint.
 * 
 * Routes defined:
 * - POST /register: User registration.
 * - POST /login: Standard email/password login.
 * - POST /login-social: Social provider login.
 * - POST /forgot-password: Initiate password recovery.
 * - POST /reset-password: Reset password using token.
 * - GET /profile: Get user profile (authenticated).
 * - PUT /profile: Update user profile (authenticated).
 * - DELETE /profile: Delete user account (authenticated).
 * 
 * @requires express
 * @requires ../controllers/AuthController
 * @requires ../middlewares/auth
 * 
 * @example
 * // Usage in the main server file:
 * const authRouter = require('./routes/auth');
 * app.use('/api/auth', authRouter);
 */
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const authController = new AuthController_1.AuthController();
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/login-social', (req, res) => authController.loginSocial(req, res));
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
router.get('/profile', auth_1.authenticateToken, (req, res) => authController.getProfile(req, res));
router.put('/profile', auth_1.authenticateToken, (req, res) => authController.updateProfile(req, res));
router.delete('/profile', auth_1.authenticateToken, (req, res) => authController.deleteMe(req, res));
exports.default = router;

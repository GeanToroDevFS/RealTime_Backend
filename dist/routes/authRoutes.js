"use strict";

/**
 * @module AuthRouter
 * @description Defines Express routes for authentication-related operations.
 * Sets up endpoints for user registration, login (email and social), password recovery,
 * profile management (get, update, delete), and applies authentication middleware where required.
 * 
 * @requires express
 * @requires ../controllers/AuthController
 * @requires ../middlewares/auth
 */

// Polyfill for importing default exports in ES modules.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");

/**
 * @description Creates an Express router instance for handling authentication routes.
 * @type {express.Router}
 */
const router = express_1.default.Router();

/**
 * @description Instance of AuthController for handling route logic.
 * @type {AuthController_1.AuthController}
 */
const authController = new AuthController_1.AuthController();

/**
 * @route POST /register
 * @description Registers a new user.
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route POST /login
 * @description Logs in a user with email and password.
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route POST /login-social
 * @description Logs in a user via social provider (e.g., Google).
 */
router.post('/login-social', (req, res) => authController.loginSocial(req, res));

/**
 * @route POST /forgot-password
 * @description Initiates password recovery process.
 */
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));

/**
 * @route POST /forgot-password
 * @description Initiates password recovery process.
 */
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

/**
 * @route GET /profile
 * @description Retrieves the authenticated user's profile.
 * @access Protected (requires JWT authentication).
 */
router.get('/profile', auth_1.authenticateToken, (req, res) => authController.getProfile(req, res));

/**
 * @route PUT /profile
 * @description Updates the authenticated user's profile.
 * @access Protected (requires JWT authentication).
 */
router.put('/profile', auth_1.authenticateToken, (req, res) => authController.updateProfile(req, res));

/**
 * @route DELETE /profile
 * @description Deletes (disables) the authenticated user's account.
 * @access Protected (requires JWT authentication).
 */
router.delete('/profile', auth_1.authenticateToken, (req, res) => authController.deleteMe(req, res));
exports.default = router;

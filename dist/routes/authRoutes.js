"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
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

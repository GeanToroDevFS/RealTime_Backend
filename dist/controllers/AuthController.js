"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const firebase_1 = require("../config/firebase");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../services/emailService");
const UserDAO_1 = require("../dao/UserDAO");
const node_fetch_1 = __importDefault(require("node-fetch"));
class AuthController {
    userDAO = new UserDAO_1.UserDAO();
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    async register(req, res) {
        try {
            const { name, lastname, email, password, confirmPassword } = req.body;
            const rawAge = req.body.age;
            const age = typeof rawAge === 'string' ? parseInt(rawAge, 10) : rawAge;
            const normEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
            if (!name || !lastname || !normEmail || !password || !confirmPassword || age === undefined) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Las contraseñas no coinciden' });
            }
            if (typeof age !== 'number' || Number.isNaN(age) || age < 18) {
                return res.status(400).json({ error: 'Debes tener al menos 18 años' });
            }
            const userRecord = await firebase_1.auth.createUser({
                email: normEmail,
                password,
                displayName: `${name} ${lastname}`,
            });
            const userData = await this.userDAO.createUser({
                name,
                lastname,
                email: normEmail,
                password,
                age,
                provider: 'email',
                uid: userRecord.uid,
            });
            const token = jsonwebtoken_1.default.sign({ userId: userRecord.uid }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: userData,
                token,
            });
        }
        catch (error) {
            console.error('Error en registro:', error);
            if (error?.code === 'auth/email-already-exists') {
                return res.status(409).json({ error: 'El correo ya está registrado' });
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async login(req, res) {
        console.log('🔵 [LOGIN] Solicitud recibida con email:', req.body.email);
        const rawEmail = req.body.email;
        const password = req.body.password;
        try {
            if (!rawEmail || !password) {
                console.warn('⚠️ [LOGIN] Datos incompletos');
                return res.status(400).json({ error: 'Email y contraseña son requeridos' });
            }
            const email = String(rawEmail).trim().toLowerCase();
            console.log('🔹 [LOGIN] Verificando credenciales con Firebase Auth REST API...');
            const apiKey = process.env.FIREBASE_API_KEY;
            const response = await (0, node_fetch_1.default)(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                const code = errorData?.error?.message || 'AUTH_ERROR';
                console.warn('⚠️ [LOGIN] Error Firebase:', code);
                if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD') {
                    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
                }
                if (code === 'OPERATION_NOT_ALLOWED') {
                    return res.status(403).json({ error: 'Inicio de sesión por email/contraseña deshabilitado en Firebase' });
                }
                if (code === 'USER_DISABLED') {
                    return res.status(403).json({ error: 'Cuenta deshabilitada' });
                }
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            const data = await response.json();
            const uid = data.localId;
            console.log('✅ [LOGIN] Credenciales válidas, UID:', uid);
            const userRecord = await firebase_1.auth.getUser(uid);
            if (userRecord.disabled) {
                console.warn('⚠️ [LOGIN] Usuario deshabilitado en Firebase');
                return res.status(403).json({ error: 'Cuenta deshabilitada' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: uid, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
            let user = await this.userDAO.getUserById(uid);
            if (!user) {
                console.log('🔹 [LOGIN] Usuario no existe en Firestore, creando con datos de Firebase Auth...');
                const displayName = userRecord.displayName || '';
                const nameParts = displayName.split(' ');
                const userCreate = {
                    name: nameParts[0] || 'Usuario',
                    lastname: nameParts.slice(1).join(' ') || '',
                    email: userRecord.email || email,
                    password: '',
                    age: 25,
                    provider: 'email',
                    uid: uid
                };
                user = await this.userDAO.createUser(userCreate);
                console.log('✅ [LOGIN] Usuario creado en Firestore');
            }
            console.log('✅ [LOGIN] Login completado');
            res.json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    firstName: user.name,
                    lastname: user.lastname,
                    lastName: user.lastname,
                    email: user.email,
                    age: user.age,
                    provider: user.provider,
                },
            });
        }
        catch (error) {
            console.error('💥 [LOGIN] Error interno:', error.message);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async loginSocial(req, res) {
        console.log('🔵 [LOGIN_SOCIAL] Solicitud de login social');
        const { idToken, provider } = req.body;
        try {
            if (!idToken || !provider) {
                console.warn('⚠️ [LOGIN_SOCIAL] Datos incompletos');
                return res.status(400).json({ error: 'ID Token y proveedor son requeridos' });
            }
            console.log('🔹 [LOGIN_SOCIAL] Verificando ID Token...');
            const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
            const uid = decodedToken.uid;
            const email = decodedToken.email;
            console.log('✅ [LOGIN_SOCIAL] Token verificado, UID:', uid);
            let user = await this.userDAO.getUserById(uid);
            if (!user) {
                console.log('🔹 [LOGIN_SOCIAL] Usuario no existe en Firestore, creando...');
                const name = decodedToken.name || 'Usuario';
                const lastname = decodedToken.family_name || '';
                const age = 25;
                const userCreate = {
                    name,
                    lastname,
                    email: email,
                    password: '',
                    age,
                    provider,
                    uid: uid
                };
                user = await this.userDAO.createUser(userCreate);
            }
            console.log('✅ [LOGIN_SOCIAL] Generando JWT...');
            const token = jsonwebtoken_1.default.sign({ userId: uid, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
            console.log('✅ [LOGIN_SOCIAL] Login social completado');
            res.json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    firstName: user.name,
                    lastname: user.lastname,
                    lastName: user.lastname,
                    email: user.email,
                    age: user.age,
                    provider: user.provider,
                },
            });
        }
        catch (error) {
            console.error('💥 [LOGIN_SOCIAL] Error interno:', error.message);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async getProfile(req, res) {
        console.log('🟡 [PROFILE] Solicitud de perfil para usuario:', req.user?.userId);
        try {
            const userId = req.user?.userId;
            if (!userId) {
                console.warn('⚠️ [PROFILE] Usuario no autenticado');
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }
            const user = await this.userDAO.getUserById(userId);
            if (!user) {
                console.warn('⚠️ [PROFILE] Usuario no encontrado');
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            console.log('✅ [PROFILE] Perfil obtenido');
            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    firstName: user.name,
                    lastname: user.lastname,
                    lastName: user.lastname,
                    email: user.email,
                    age: user.age,
                    provider: user.provider,
                },
            });
        }
        catch (error) {
            console.error('💥 [PROFILE] Error interno:', error.message);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async updateProfile(req, res) {
        console.log('🟠 [UPDATE] Solicitud de actualización para usuario:', req.user?.userId);
        const { name, lastname, email, age } = req.body;
        try {
            const userId = req.user?.userId;
            if (!userId) {
                console.warn('⚠️ [UPDATE] Usuario no autenticado');
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }
            const updates = { name, lastname, email, age };
            const updatedUser = await this.userDAO.updateUser(userId, updates);
            console.log('✅ [UPDATE] Perfil actualizado');
            res.json({
                message: 'Perfil actualizado exitosamente',
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    firstName: updatedUser.name,
                    lastname: updatedUser.lastname,
                    lastName: updatedUser.lastname,
                    email: updatedUser.email,
                    age: updatedUser.age,
                    provider: updatedUser.provider,
                },
            });
        }
        catch (error) {
            console.error('💥 [UPDATE] Error interno:', error.message);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async forgotPassword(req, res) {
        console.log('🔴 [FORGOT] Solicitud de recuperación para email:', req.body.email);
        const { email } = req.body;
        try {
            if (!email) {
                console.warn('⚠️ [FORGOT] Email no proporcionado');
                return res.status(400).json({ error: 'Email es requerido' });
            }
            console.log('🔹 [FORGOT] Generando token de recuperación...');
            const resetToken = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('📧 [FORGOT] Enviando email de recuperación...');
            await (0, emailService_1.sendRecoveryEmail)(email, resetToken);
            console.log('✅ [FORGOT] Email enviado');
            res.json({ message: 'Se ha enviado un email con instrucciones para restablecer tu contraseña' });
        }
        catch (error) {
            console.error('💥 [FORGOT] Error interno:', error.message);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async resetPassword(req, res) {
        console.log('🟣 [RESET] Solicitud de reset de contraseña');
        const { token, newPassword } = req.body;
        try {
            if (!token || !newPassword) {
                console.warn('⚠️ [RESET] Datos incompletos');
                return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
            }
            console.log('🔹 [RESET] Verificando token...');
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const email = decoded.email;
            console.log('🔹 [RESET] Verificando si usuario existe en Firebase Auth...');
            const userRecord = await firebase_1.auth.getUserByEmail(email);
            console.log('🔹 [RESET] Actualizando contraseña en Firebase Auth...');
            await firebase_1.auth.updateUser(userRecord.uid, {
                password: newPassword,
            });
            console.log('✅ [RESET] Contraseña restablecida');
            res.json({ message: 'Contraseña restablecida exitosamente' });
        }
        catch (error) {
            console.error('💥 [RESET] Error interno:', error.message);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    async deleteMe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ error: 'Usuario no autenticado' });
            await firebase_1.auth.updateUser(userId, { disabled: true });
            await this.userDAO.deleteUser(userId);
            res.json({ message: 'Cuenta desactivada. Puedes crear una nueva.' });
        }
        catch (error) {
            console.error('Error al desactivar cuenta:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}
exports.AuthController = AuthController;

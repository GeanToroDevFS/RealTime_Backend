import { auth, db } from '../config/firebase';
import jwt from 'jsonwebtoken';
import { sendRecoveryEmail } from '../services/emailService';
import { UserDAO } from '../dao/UserDAO';
import { User, UserCreate, UserUpdate } from '../models/User';
import { Request, Response } from 'express';
import fetch from 'node-fetch';

/**
 * Controller responsible for authentication-related operations.
 *
 * Provides endpoints for:
 *  - register: create a new user (Firebase Auth + Firestore)
 *  - login: issue a JWT for an existing Firebase user
 *  - loginSocial: handle social sign-in using Firebase ID tokens
 *  - getProfile: return the authenticated user's profile
 *  - updateProfile: update user's profile in Firestore
 *  - forgotPassword: generate a reset token and sending an email
 *  - resetPassword: verify reset token and update password in Firebase Auth
 *
 * All methods expect Express Request and Response objects and send HTTP responses
 * directly. Errors are logged and result in 500 responses where not handled.
 */
export class AuthController {
  /**
   * Data access object used to interact with user storage (Firestore).
   * @private
   * @type {UserDAO}
   */
  private userDAO = new UserDAO();

  /**
   * Calculate age from a birth date string (ISO date expected).
   *
   * @private
   * @param {string} birthDate - The birth date as a string (e.g. "1990-01-01").
   * @returns {number} The calculated age in years.
   */
  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Register a new user.
   *
   * Creates a user in Firebase Auth and stores additional profile data in Firestore via UserDAO.
   * Expects request body to contain: name, lastname, email, password, confirmPassword, age.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<void>} Sends HTTP response with created user data or error.
   */
  async register(req: Request, res: Response) {
    try {
      const { name, lastname, email, password, confirmPassword } = req.body;
      const rawAge = (req.body as any).age;
      const age: number = typeof rawAge === 'string' ? parseInt(rawAge, 10) : rawAge;
      const normEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
      // Validaciones (corregido)
      if (!name || !lastname || !normEmail || !password || !confirmPassword || age === undefined) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }
      if (typeof age !== 'number' || Number.isNaN(age) || age < 18) {
        return res.status(400).json({ error: 'Debes tener al menos 18 años' });
      }
      // Crear usuario en Firebase Auth
      const userRecord = await auth.createUser({
        email: normEmail,
        password,
        displayName: `${name} ${lastname}`,
      });
      // Use UserDAO to save to Firestore (password added)
      const userData = await this.userDAO.createUser({
        name,
        lastname,
        email: normEmail,
        password,  
        age,  
        provider: 'email',
        uid: userRecord.uid,
      });
      // Generate JWT (changed to userId for consistency)
      const token = jwt.sign({ userId: userRecord.uid }, process.env.JWT_SECRET!, { expiresIn: '24h' });
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userData,
        token,
      });
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error?.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Login endpoint that issues a server JWT after verifying the Firebase user exists.
   *
   * Note: This method does not verify plaintext passwords against Firebase (Firebase Admin SDK
   * doesn't expose password verification). It assumes authentication is performed on the client
   * and this endpoint issues a server JWT for server-side sessions.
   *
   * Expects request body to contain: email, password.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<void>} Sends HTTP response with JWT and user info or error.
   */
  async login(req: Request, res: Response) {
    console.log('🔵 [LOGIN] Solicitud recibida con email:', req.body.email);

    const rawEmail: string | undefined = req.body.email;
    const password: string | undefined = req.body.password;

    try {
      if (!rawEmail || !password) {
        console.warn('⚠️ [LOGIN] Datos incompletos');
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const email = String(rawEmail).trim().toLowerCase();

      console.log('🔹 [LOGIN] Verificando credenciales con Firebase Auth REST API...');

      // Use Firebase Auth REST API to verify email and password
      const apiKey = process.env.FIREBASE_API_KEY!;
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      });
      if (!response.ok) {
        const errorData = await response.json() as any;
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
      const data = await response.json() as any;
      const uid = data.localId;  // UID del usuario
      console.log('✅ [LOGIN] Credenciales válidas, UID:', uid);

      // Additional user validations in Firebase (disabled only)
      const userRecord = await auth.getUser(uid);
      if (userRecord.disabled) {
        console.warn('⚠️ [LOGIN] Usuario deshabilitado en Firebase');
        return res.status(403).json({ error: 'Cuenta deshabilitada' });
      }

      // Generate JWT
      const token = jwt.sign({ userId: uid, email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

      // Get/create Firestore data
      let user = await this.userDAO.getUserById(uid);
      if (!user) {
        console.log('🔹 [LOGIN] Usuario no existe en Firestore, creando con datos de Firebase Auth...');
        const displayName = userRecord.displayName || '';
        const nameParts = displayName.split(' ');
        const userCreate: UserCreate = {
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
      // Extended answer with alias for frontend that can expect firstName/lastName
      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          name: user.name,
          firstName: user.name, // alias
          lastname: user.lastname,
          lastName: user.lastname, // alias
          email: user.email,
          age: user.age,
          provider: user.provider,
        },
      });
    } catch (error: any) {
      console.error('💥 [LOGIN] Error interno:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async loginSocial(req: Request, res: Response) {
    console.log('🔵 [LOGIN_SOCIAL] Solicitud de login social');

    const { idToken, provider } = req.body; // Firebase idToken, provider: 'google', 'facebook', 'github'

    try {
      if (!idToken || !provider) {
        console.warn('⚠️ [LOGIN_SOCIAL] Datos incompletos');
        return res.status(400).json({ error: 'ID Token y proveedor son requeridos' });
      }

      console.log('🔹 [LOGIN_SOCIAL] Verificando ID Token...');
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const email = decodedToken.email;

      console.log('✅ [LOGIN_SOCIAL] Token verificado, UID:', uid);

      // Check if the user exists in Firestore
      let user = await this.userDAO.getUserById(uid);
      if (!user) {
        console.log('🔹 [LOGIN_SOCIAL] Usuario no existe en Firestore, creando...');
        // Create user in Firestore with token data
        const name = decodedToken.name || 'Usuario';
        const lastname = decodedToken.family_name || '';
        const age = 25;  // Default value, the user can update it later
        const userCreate: UserCreate = {
          name,
          lastname,
          email: email!,
          password: '', // Not applicable to social services
          age,
          provider,
          uid: uid
        };
        user = await this.userDAO.createUser(userCreate);
      }

      console.log('✅ [LOGIN_SOCIAL] Generando JWT...');
      // JWT consistent with userId
      const token = jwt.sign(
        { userId: uid, email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

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
    } catch (error: any) {
      console.error('💥 [LOGIN_SOCIAL] Error interno:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }


  /**
   * Retrieve the authenticated user's profile.
   *
   * Expects middleware to populate (req as any).user?.userId from a validated server JWT.
   *
   * @param {Request} req - Express request object (must include user info).
   * @param {Response} res - Express response object.
   * @returns {Promise<void>} Sends HTTP response with user profile or error.
   */
  async getProfile(req: Request, res: Response) {
    console.log('🟡 [PROFILE] Solicitud de perfil para usuario:', (req as any).user?.userId);

    try {
      const userId = (req as any).user?.userId;
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
    } catch (error: any) {
      console.error('💥 [PROFILE] Error interno:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Update the authenticated user's profile.
   *
   * Expects (req as any).user?.userId to be set by authentication middleware.
   * Accepts partial updates for: name, lastname, email, age.
   *
   * @param {Request} req - Express request object (must include user info and update payload).
   * @param {Response} res - Express response object.
   * @returns {Promise<void>} Sends HTTP response with updated user data or error.
   */
  async updateProfile(req: Request, res: Response) {
    console.log('🟠 [UPDATE] Solicitud de actualización para usuario:', (req as any).user?.userId);

    const { name, lastname, email, age } = req.body;  // Cambiado de birthdate

    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        console.warn('⚠️ [UPDATE] Usuario no autenticado');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const updates: UserUpdate = { name, lastname, email, age };  // Cambiado de birthdate
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
    } catch (error: any) {
      console.error('💥 [UPDATE] Error interno:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Start the forgot-password flow by generating a short-lived token and sending an email.
   *
   * Expects request body to contain: email.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<void>} Sends HTTP response indicating email was sent or error.
   */
  async forgotPassword(req: Request, res: Response) {
    console.log('🔴 [FORGOT] Solicitud de recuperación para email:', req.body.email);

    const { email } = req.body;

    try {
      if (!email) {
        console.warn('⚠️ [FORGOT] Email no proporcionado');
        return res.status(400).json({ error: 'Email es requerido' });
      }

      console.log('🔹 [FORGOT] Generando token de recuperación...');
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      console.log('📧 [FORGOT] Enviando email de recuperación...');
      await sendRecoveryEmail(email, resetToken);

      console.log('✅ [FORGOT] Email enviado');
      res.json({ message: 'Se ha enviado un email con instrucciones para restablecer tu contraseña' });
    } catch (error: any) {
      console.error('💥 [FORGOT] Error interno:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Reset the user's password using a token previously issued by forgotPassword.
   *
   * Expects request body to contain: token, newPassword.
   * The token is verified and the corresponding Firebase user's password is updated.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {Promise<void>} Sends HTTP response confirming password reset or error.
   */
  async resetPassword(req: Request, res: Response) {
    console.log('🟣 [RESET] Solicitud de reset de contraseña');

    const { token, newPassword } = req.body;

    try {
      if (!token || !newPassword) {
        console.warn('⚠️ [RESET] Datos incompletos');
        return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
      }

      console.log('🔹 [RESET] Verificando token...');
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const email = decoded.email;

      console.log('🔹 [RESET] Verificando si usuario existe en Firebase Auth...');
      const userRecord = await auth.getUserByEmail(email);  // Check existence

      console.log('🔹 [RESET] Actualizando contraseña en Firebase Auth...');
      await auth.updateUser(userRecord.uid, {
        password: newPassword,
      });

      console.log('✅ [RESET] Contraseña restablecida');
      res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error: any) {
      console.error('💥 [RESET] Error interno:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // To deleteMe, switch to disable.
  async deleteMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
      // To deleteMe, switch to disable.
      await auth.updateUser(userId, { disabled: true });
      // Remove from Firestore
      await this.userDAO.deleteUser(userId);
      res.json({ message: 'Cuenta desactivada. Puedes crear una nueva.' });
    } catch (error: any) {
      console.error('Error al desactivar cuenta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
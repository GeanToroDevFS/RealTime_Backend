"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRecoveryEmail = void 0;
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
console.log('🔹 [EMAIL] Cargando configuración de Brevo...');
dotenv_1.default.config();
if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY no definida');
    throw new Error('Falta BREVO_API_KEY en variables de entorno');
}
if (!process.env.EMAIL_SENDER) {
    console.warn('⚠️ EMAIL_SENDER no definida, usando por defecto');
}

/**
 * @module EmailService
 * @description Module for sending transactional emails using the Brevo (formerly Sendinblue) API.
 * This module initializes the Brevo client using environment variables and provides a function
 * to send password recovery emails. It handles configuration loading, client authentication,
 * and error logging. The email includes an HTML template for better user experience and a plain text fallback.
 * 
 * Environment variables required:
 * - `BREVO_API_KEY`: API key for Brevo authentication (required).
 * - `EMAIL_SENDER`: Sender email address (optional, defaults to 'noreply@realtime.app').
 * - `FRONTEND_URL`: Base URL for the frontend application (optional, defaults to 'http://localhost:5173').
 * 
 * If `BREVO_API_KEY` is missing, an error is thrown during initialization.
 * 
 * Logging is performed with emojis for visual feedback on operations and errors.
 * 
 * @requires sib-api-v3-sdk
 * @requires dotenv
 * 
 * @example
 * // Usage:
 * const { sendRecoveryEmail } = require('./emailService');
 * await sendRecoveryEmail('user@example.com', 'reset-token');
 */
console.log('🔹 [EMAIL] Inicializando cliente Brevo...');
const defaultClient = sib_api_v3_sdk_1.default.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const brevoApi = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
console.log('✅ [EMAIL] Cliente Brevo inicializado.');

/**
 * Sends a password recovery email to the specified user.
 * 
 * This function generates a recovery link using the provided reset token and frontend URL,
 * constructs an email with HTML and text content, and sends it via the Brevo API.
 * It logs the process and any errors encountered.
 * 
 * @async
 * @function sendRecoveryEmail
 * @param {string} userEmail - The recipient's email address.
 * @param {string} resetToken - The JWT reset token to include in the recovery link.
 * @returns {Promise<void>} Resolves when the email is sent successfully.
 * @throws {Error} If there is an issue sending the email (e.g., API error or configuration issue).
 * 
 * @example
 * await sendRecoveryEmail('user@example.com', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
const sendRecoveryEmail = async (userEmail, resetToken) => {
    console.log('\n==============================');
    console.log('📩 [EMAIL] Enviando recuperación de contraseña');
    console.log('📧 Destinatario:', userEmail);
    console.log('==============================');
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const senderEmail = process.env.EMAIL_SENDER || 'noreply@realtime.app';
        const recoveryLink = `${frontendUrl}/reset?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;
        console.log('🔗 [EMAIL] Enlace generado:', recoveryLink);
        const sendSmtpEmail = {
            sender: { email: senderEmail, name: 'RealTime' },
            to: [{ email: userEmail }],
            subject: '🔑 Recuperación de Contraseña - RealTime',
            htmlContent: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f9ff; color: #222; padding: 30px; border-radius: 10px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); padding: 30px;">
            <h2 style="color:#1d4ed8; text-align:center;">🔐 Recupera tu contraseña</h2>
            <p style="font-size:16px; line-height:1.5;">Hola 👋, has solicitado restablecer tu contraseña en <strong>RealTime</strong>.</p>
            <p style="font-size:16px; line-height:1.5;">Haz clic en el siguiente botón para restablecerla:</p>
            <div style="text-align:center; margin: 30px 0;">
              <a href="${recoveryLink}"
                style="background-color:#1d4ed8; color:#fff; padding: 12px 25px; border-radius:8px;
                       text-decoration:none; font-weight:600; font-size:15px; display:inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="font-size:15px; color:#444;">⚠️ Este enlace expira en 1 hora.</p>
            <p style="font-size:15px; color:#444;">Si no solicitaste este cambio, simplemente ignora este correo.</p>
            <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;">
            <p style="font-size:12px; color:#888; text-align:center;">© 2024 RealTime - Todos los derechos reservados</p>
          </div>
        </div>
      `,
            textContent: `
        Recuperación de contraseña - RealTime

        Hola, has solicitado restablecer tu contraseña.
        Haz clic en este enlace para continuar:
        ${recoveryLink}

        Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.

        © 2024 RealTime
      `,
        };
        console.log('📨 [EMAIL] Enviando correo...');
        const response = await brevoApi.sendTransacEmail(sendSmtpEmail);
        console.log('✅ [EMAIL] Correo enviado correctamente');
        console.log('📬 [EMAIL] Estado:', response?.response?.status || 'OK');
        console.log('🆔 [EMAIL] Message ID:', response?.messageId || 'N/A');
        console.log('==============================\n');
    }
    catch (error) {
        console.error('❌ [EMAIL] Error enviando correo:');
        if (error.response && error.response.body) {
            console.error('📛 [EMAIL] Código HTTP:', error.response.status);
            console.error('📄 [EMAIL] Detalle:', JSON.stringify(error.response.body, null, 2));
        }
        else {
            console.error('📄 [EMAIL] Error genérico:', error.message || error);
        }
        throw new Error(`Error al enviar email: ${error.message}`);
    }
};
exports.sendRecoveryEmail = sendRecoveryEmail;

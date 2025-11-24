/**
 * Email service using Brevo (SendinBlue) transactional emails API.
 *
 * This module initializes the Brevo client using the API key provided in
 * the BREVO_API_KEY environment variable and exposes helper functions to
 * send transactional emails used by the application (currently password recovery).
 *
 * Environment variables used:
 *  - BREVO_API_KEY: API key for Brevo (required)
 *  - EMAIL_SENDER: Optional sender email address (defaults to 'noreply@realtime.app')
 *  - FRONTEND_URL: URL for the frontend used to build recovery links (defaults to http://localhost:5173)
 *
 * Notes:
 *  - The module will throw during initialization if BREVO_API_KEY is not defined.
 *  - sendRecoveryEmail logs progress and details (avoid logging sensitive info in production).
 */
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

console.log('🔹 [EMAIL] Cargando configuración de Brevo...');
dotenv.config();

if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY no definida');
  throw new Error('Falta BREVO_API_KEY en variables de entorno');
}

if (!process.env.EMAIL_SENDER) {
  console.warn('⚠️ EMAIL_SENDER no definida, usando por defecto');
}

console.log('🔹 [EMAIL] Inicializando cliente Brevo...');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY!;
const brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
console.log('✅ [EMAIL] Cliente Brevo inicializado.');

/**
 * Send a password recovery email to a user.
 *
 * The function builds a one-hour JWT-based reset token (generated elsewhere),
 * composes a recovery link using FRONTEND_URL and the provided token and email,
 * and sends a transactional email via Brevo. Progress and response details are logged.
 *
 * On failure, the function logs the Brevo error details (if present) and rethrows an Error.
 *
 * @async
 * @function sendRecoveryEmail
 * @param {string} userEmail - The recipient user's email address.
 * @param {string} resetToken - A short-lived token used to verify the password reset request.
 * @returns {Promise<void>} Resolves when the email was sent successfully. Rejects with an Error when sending fails.
 * @throws {Error} When Brevo client returns an error or sending fails.
 */
export const sendRecoveryEmail = async (userEmail: string, resetToken: string) => {
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
  } catch (error: any) {
    console.error('❌ [EMAIL] Error enviando correo:');
    if (error.response && error.response.body) {
      console.error('📛 [EMAIL] Código HTTP:', error.response.status);
      console.error('📄 [EMAIL] Detalle:', JSON.stringify(error.response.body, null, 2));
    } else {
      console.error('📄 [EMAIL] Error genérico:', error.message || error);
    }
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};
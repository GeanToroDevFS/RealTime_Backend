"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("./middlewares/cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(cors_1.default);
app.use(express_1.default.json());
app.use('/api', authRoutes_1.default);
app.use('/', authRoutes_1.default);
app.get('/', (req, res) => {
    console.log('🚀 [HEALTH] Solicitud de health check');
    res.send('🚀 Backend RealTime funcionando correctamente.');
});
app.get('/debug', (req, res) => {
    console.log('🔍 [DEBUG] Solicitud de información de debug');
    res.json({
        environment: process.env.NODE_ENV,
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ No configurado',
        brevoKey: process.env.BREVO_API_KEY ? '✅ Configurado' : '❌ No configurado',
        port: PORT
    });
});
app.use((err, req, res, next) => {
    console.error('💥 [ERROR] Error no manejado:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});
app.listen(PORT, () => {
    console.log(`🌐 [STARTUP] Servidor corriendo en puerto ${PORT}`);
    console.log(`🔍 [STARTUP] Debug disponible en: http://localhost:${PORT}/debug`);
});

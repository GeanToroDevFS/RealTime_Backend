# RealTime Backend

**RealTime Backend** es el backend del proyecto RealTime, construido con Node.js, Express y TypeScript. Está pensado para soportar funcionalidades de autenticación, comunicación en tiempo real y envío de mensajes/notifications, integrando Firebase (Admin SDK) para gestión de credenciales/usuarios, JWT para tokens y una SDK de envío de emails (SendinBlue / sib-api-v3-sdk). El proyecto está preparado para desarrollo local con recarga (nodemon + tsx) y compilación a JavaScript con tsc.

---

##  Descripción del Proyecto

Este backend proporciona:
- Autenticación y verificación (integración con Firebase Admin + JWT).
- Endpoints REST para gestión de usuarios y recursos.
- Integración para envío de emails/notifications usando la SDK de SendinBlue.
- Configuración de CORS y variables de entorno mediante dotenv.
- Preparado para ser desplegado (carpeta dist/ con build de TypeScript).

Diseñado con una estructura modular, usando TypeScript para mayor robustez y tipado.

---

## 🧩 Tecnologías Utilizadas

| Tipo | Tecnología |
|------|-------------|
| **Lenguaje** | TypeScript |
| **Backend** | Node.js, Express |
| **Autenticación / Admin** | firebase-admin (Firebase Admin SDK), jsonwebtoken (JWT) |
| **Emails / Notificaciones** | sib-api-v3-sdk (SendinBlue) |
| **Seguridad** | cors |
| **Entorno** | dotenv |
| **Desarrollo** | nodemon, tsx |
| **Compilación** | tsc (TypeScript) |

---

## 🗂 Estructura del Proyecto (resumen)

📂 RealTime_Backend/
│
├── 📁 api/                # Código fuente TypeScript del servidor (entry: api/index.ts)
├── 📁 dist/               # Código compilado (build output)
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md


---

## ⚙️ Scripts disponibles (package.json)

- npm run dev — Desarrollo (nodemon --exec tsx api/index.ts)
- npm run build — Compilar TypeScript a JavaScript (tsc)
- npm run start — Iniciar servidor desde dist (node dist/index.js)

---

## 🔧 Variables de Entorno (ejemplo .env)

Crea un archivo `.env` en la raíz con las variables necesarias. Ajusta nombres según el código de `api/`:

```bash
PORT=3000
FRONTEND_URL=http://localhost:5173

# Firebase Admin (ruta al archivo de credenciales o JSON en variable)
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
# Alternativamente, si el proyecto usa una variable con el JSON:
# FIREBASE_SERVICE_ACCOUNT_JSON='{"type":...}'

# JWT
JWT_SECRET=tu_secreto_jwt

# SendinBlue (sib-api-v3-sdk)
SIB_API_KEY=tu_sendinblue_api_key

# Entorno
NODE_ENV=development
```

No subas credenciales ni el archivo de credenciales de Firebase al repositorio.

---

## ▶️ Cómo ejecutar el proyecto

1. Instalar dependencias
```bash
npm install
```

2. Modo desarrollo (hot-reload)
```bash
npm run dev
```

3. Compilar a JavaScript
```bash
npm run build
```

4. Ejecutar build
```bash
npm run start
```

---

## 🔍 Rutas

Revisa el archivo `api/index.ts` y los routers dentro de `api/` para la lista exacta de endpoints. A modo de referencia, en proyectos con esta composición normalmente encontrarás endpoints como:

- GET /                      — Health check / estado del servidor
- POST /auth/register        — Registro de usuarios (delegado a Firebase o lógica propia)
- POST /auth/login           — Inicio de sesión / emisión de JWT
- GET /users                 — Listar usuarios (protegido, requiere JWT)
- POST /messages/send        — Enviar notificación / email (usa SendinBlue)
- WebSocket / Socket.IO      — Endpoints / handlers para comunicación en tiempo real (si aplica)

Asegúrate de revisar la implementación real en `api/` para confirmar rutas, middleware y protección con JWT/CORS.

---

## 🛡️ Seguridad y buenas prácticas

- Mantén las variables sensibles en `.env` y no las subas a Git.
- Verifica orígenes permitidos en la configuración CORS.
- Protege endpoints con JWT y valida permisos/roles según sea necesario.
- Restrinje el acceso a la clave de SendinBlue y al service account de Firebase.

---

## 👨‍💻 Autor

Gean Franco Muñoz Toro  
Proyecto Backend — RealTime Backend

---

## 📜 Licencia

Este proyecto está licenciado bajo la MIT License.
Puedes usarlo, modificarlo y distribuirlo libremente con atribución al autor.
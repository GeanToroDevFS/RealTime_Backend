"use strict";

/**
 * @module FirebaseAdminInitializer
 * @description Initializes the Firebase Admin SDK using environment variables loaded from a .env file.
 * This module sets up Firestore and Authentication services, performs basic validation of required environment variables,
 * and exports the initialized Firestore database and Authentication instances.
 * 
 * @requires firebase-admin
 * @requires dotenv
 * 
 * @throws {Error} If required environment variables (FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_KEY) are missing.
 */

// Polyfill for creating bindings in ES modules (used for importing modules).
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));

// Polyfill for setting default exports in ES modules.
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});

// Polyfill for importing modules as stars (e.g., import * as admin from 'firebase-admin').
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();

// Polyfill for importing default exports.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;

// Polyfill for importing default exports.
const admin = __importStar(require("firebase-admin"));

// Import dotenv for loading environment variables.
const dotenv_1 = __importDefault(require("dotenv"));

/**
 * @description Logs the start of configuration loading for Firebase.
 */
console.log('🔹 [FIREBASE] Cargando configuración...');

// Load environment variables from .env file.
dotenv_1.default.config();

/**
 * @description Parses the Firebase service account key from environment variables.
 * @type {Object}
 */
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log('🔍 [FIREBASE] Verificando variables...');
console.log(' - FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ OK' : '❌ NO DEFINIDA');
console.log(' - FIREBASE_SERVICE_ACCOUNT_KEY:', serviceAccount ? '✅ OK' : '❌ NO DEFINIDA');

/**
 * @description Validates the presence of required environment variables.
 * Throws an error if any are missing.
 */
if (!process.env.FIREBASE_PROJECT_ID || !serviceAccount) {
    throw new Error('❌ Faltan variables de entorno para conectar con Firebase.');
}

/**
 * @description Initializes the Firebase Admin app with the provided credentials and project ID.
 */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
});

/**
 * @description Initializes the Firebase Admin app with the provided credentials and project ID.
 */
const db = admin.firestore();
exports.db = db;

/**
 * @description The initialized Firebase Authentication instance.
 * @type {admin.auth.Auth}
 */
const auth = admin.auth();
exports.auth = auth;

/**
 * @description Logs successful initialization of the Firebase client.
 */
console.log('✅ [FIREBASE] Cliente inicializado correctamente.');

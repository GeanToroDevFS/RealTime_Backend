"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;

/**
 * @module FirebaseInitialization
 * @description This module initializes the Firebase Admin SDK using environment variables.
 * It loads configuration from a .env file, verifies required variables, and sets up Firestore and Authentication services.
 * The module exports the Firestore database instance (`db`) and the Authentication instance (`auth`).
 * 
 * Environment variables required:
 * - `FIREBASE_PROJECT_ID`: The Firebase project ID.
 * - `FIREBASE_SERVICE_ACCOUNT_KEY`: A JSON string representing the service account key.
 * 
 * If any required variables are missing, an error is thrown.
 * 
 * Logging is performed to indicate the status of initialization, with emojis for visual feedback.
 * 
 * @requires firebase-admin
 * @requires dotenv
 * 
 * @example
 * // Usage in another module:
 * const { db, auth } = require('./this-module');
 * // Now use db for Firestore operations or auth for authentication tasks.
 */
const admin = __importStar(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
console.log('🔹 [FIREBASE] Cargando configuración...');
dotenv_1.default.config();
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log('🔍 [FIREBASE] Verificando variables...');
console.log(' - FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ OK' : '❌ NO DEFINIDA');
console.log(' - FIREBASE_SERVICE_ACCOUNT_KEY:', serviceAccount ? '✅ OK' : '❌ NO DEFINIDA');
if (!process.env.FIREBASE_PROJECT_ID || !serviceAccount) {
    throw new Error('❌ Faltan variables de entorno para conectar con Firebase.');
}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
});

/**
 * The Firestore database instance initialized with the Firebase Admin SDK.
 * Use this to perform database operations like reading, writing, or querying documents.
 * 
 * @type {admin.firestore.Firestore}
 */
const db = admin.firestore();
exports.db = db;

/**
 * The Firebase Authentication instance initialized with the Firebase Admin SDK.
 * Use this for server-side authentication tasks, such as verifying tokens or managing users.
 * 
 * @type {admin.auth.Auth}
 */
const auth = admin.auth();
exports.auth = auth;
console.log('✅ [FIREBASE] Cliente inicializado correctamente.');

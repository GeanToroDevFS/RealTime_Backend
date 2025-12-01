"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDAO = void 0;
const firebase_1 = require("../config/firebase");

/**
 * @class UserDAO
 * @description Data Access Object (DAO) for user-related operations in Firestore.
 * This class provides methods to create, read, update, and delete user documents in the 'users' collection.
 * It uses the Firebase Admin SDK for database interactions and includes logging for operations.
 * 
 * @requires ../config/firebase
 * 
 * @example
 * // Usage:
 * const userDAO = new UserDAO();
 * const newUser = await userDAO.createUser({ name: 'John', lastname: 'Doe', email: 'john@example.com', age: 30, provider: 'email' });
 */
class UserDAO {

    /**
     * Creates a new user document in Firestore.
     * Uses the provided UID or generates a new document ID if not provided.
     * 
     * @async
     * @param {Object} userData - The user data to create.
     * @param {string} userData.uid - Optional unique identifier for the user (used as document ID).
     * @param {string} userData.name - The user's first name.
     * @param {string} userData.lastname - The user's last name.
     * @param {string} userData.email - The user's email address.
     * @param {number} userData.age - The user's age.
     * @param {string} [userData.provider='email'] - The authentication provider (default: 'email').
     * @returns {Promise<Object>} The created user object with ID and data.
     * @throws {Error} If the Firestore operation fails.
     */
    async createUser(userData) {
        console.log('🔹 [USERDAO] Creando usuario en Firestore...');
        const docId = userData.uid || firebase_1.db.collection('users').doc().id;
        const userRef = firebase_1.db.collection('users').doc(docId);
        const user = {
            id: userRef.id,
            name: userData.name,
            lastname: userData.lastname,
            email: userData.email,
            age: userData.age,
            provider: userData.provider || 'email',
        };
        await userRef.set({
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            age: user.age,
            provider: user.provider,
        });
        console.log('✅ [USERDAO] Usuario creado correctamente');
        return user;
    }

    /**
     * Retrieves a user by their document ID from Firestore.
     * 
     * @async
     * @param {string} id - The document ID of the user.
     * @returns {Promise<Object|null>} The user object if found, otherwise null.
     * @throws {Error} If the Firestore operation fails.
     */
    async getUserById(id) {
        console.log(`🔹 [USERDAO] Buscando usuario por ID: ${id}`);
        const userDoc = await firebase_1.db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            console.log('⚠️ [USERDAO] Usuario no encontrado');
            return null;
        }
        const data = userDoc.data();
        console.log('✅ [USERDAO] Usuario encontrado');
        return {
            id: userDoc.id,
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            age: data.age,
            provider: data.provider,
        };
    }

    /**
     * Retrieves a user by their email address from Firestore.
     * Queries the 'users' collection for a matching email (limited to 1 result).
     * 
     * @async
     * @param {string} email - The email address to search for.
     * @returns {Promise<Object|null>} The user object if found, otherwise null.
     * @throws {Error} If the Firestore operation fails.
     */
    async getUserByEmail(email) {
        console.log(`🔹 [USERDAO] Buscando usuario por email: ${email}`);
        const userQuery = await firebase_1.db.collection('users').where('email', '==', email).limit(1).get();
        if (userQuery.empty) {
            console.log('⚠️ [USERDAO] Usuario no encontrado');
            return null;
        }
        const userDoc = userQuery.docs[0];
        const data = userDoc.data();
        console.log('✅ [USERDAO] Usuario encontrado');
        return {
            id: userDoc.id,
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            age: data.age,
            provider: data.provider,
        };
    }

    /**
     * Retrieves a user by their email address from Firestore.
     * Queries the 'users' collection for a matching email (limited to 1 result).
     * 
     * @async
     * @param {string} email - The email address to search for.
     * @returns {Promise<Object|null>} The user object if found, otherwise null.
     * @throws {Error} If the Firestore operation fails.
     */
    async updateUser(id, updates) {
        console.log(`🔹 [USERDAO] Actualizando usuario: ${id}`);
        const userRef = firebase_1.db.collection('users').doc(id);
        const updateData = {};
        if (updates.name)
            updateData.name = updates.name;
        if (updates.lastname)
            updateData.lastname = updates.lastname;
        if (updates.email)
            updateData.email = updates.email;
        if (updates.age)
            updateData.age = updates.age;
        await userRef.update(updateData);
        const updatedDoc = await userRef.get();
        const data = updatedDoc.data();
        console.log('✅ [USERDAO] Usuario actualizado correctamente');
        return {
            id: updatedDoc.id,
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            age: data.age,
            provider: data.provider,
        };
    }

    /**
     * Deletes a user document from Firestore by ID.
     * 
     * @async
     * @param {string} id - The document ID of the user to delete.
     * @returns {Promise<void>}
     * @throws {Error} If the Firestore operation fails.
     */
    async deleteUser(id) {
        console.log(`🔹 [USERDAO] Eliminando usuario: ${id}`);
        await firebase_1.db.collection('users').doc(id).delete();
        console.log('✅ [USERDAO] Usuario eliminado correctamente');
    }
}
exports.UserDAO = UserDAO;

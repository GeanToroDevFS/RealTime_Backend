"use strict";

/**
 * @module UserDAO
 * @description Data Access Object (DAO) for managing user data in Firestore.
 * Provides methods to create, retrieve, update, and delete user records.
 * 
 * @requires ../config/firebase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDAO = void 0;
const firebase_1 = require("../config/firebase");

/**
 * @class UserDAO
 * @description Class for performing CRUD operations on user documents in Firestore.
 * All methods are asynchronous and interact with the 'users' collection.
 */
class UserDAO {

    /**
     * @method createUser
     * @description Creates a new user document in Firestore.
     * Uses the provided UID as the document ID if available, otherwise generates a new one.
     * @param {Object} userData - The user data to create.
     * @param {string} userData.uid - Optional unique identifier for the user (used as document ID).
     * @param {string} userData.name - User's first name.
     * @param {string} userData.lastname - User's last name.
     * @param {string} userData.email - User's email address.
     * @param {number} userData.age - User's age.
     * @param {string} [userData.provider='email'] - Authentication provider (e.g., 'email', 'google').
     * @returns {Promise<Object>} The created user object with id, name, lastname, email, age, and provider.
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
     * @method getUserById
     * @description Retrieves a user document from Firestore by its ID.
     * @param {string} id - The ID of the user document to retrieve.
     * @returns {Promise<Object|null>} The user object with id, name, lastname, email, age, and provider, or null if not found.
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
     * @method getUserByEmail
     * @description Retrieves a user document from Firestore by email address.
     * Limits the query to one result for efficiency.
     * @param {string} email - The email address of the user to retrieve.
     * @returns {Promise<Object|null>} The user object with id, name, lastname, email, age, and provider, or null if not found.
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
     * @method updateUser
     * @description Updates specific fields of a user document in Firestore.
     * Only provided fields in updates are modified.
     * @param {string} id - The ID of the user document to update.
     * @param {Object} updates - The fields to update.
     * @param {string} [updates.name] - New first name.
     * @param {string} [updates.lastname] - New last name.
     * @param {string} [updates.email] - New email address.
     * @param {number} [updates.age] - New age.
     * @returns {Promise<Object>} The updated user object with id, name, lastname, email, age, and provider.
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
     * @method deleteUser
     * @description Deletes a user document from Firestore by its ID.
     * @param {string} id - The ID of the user document to delete.
     * @returns {Promise<void>}
     */
    async deleteUser(id) {
        console.log(`🔹 [USERDAO] Eliminando usuario: ${id}`);
        await firebase_1.db.collection('users').doc(id).delete();
        console.log('✅ [USERDAO] Usuario eliminado correctamente');
    }
}
exports.UserDAO = UserDAO;

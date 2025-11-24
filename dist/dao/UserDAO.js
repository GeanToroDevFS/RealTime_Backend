"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDAO = void 0;
const firebase_1 = require("../config/firebase");
class UserDAO {
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
    async deleteUser(id) {
        console.log(`🔹 [USERDAO] Eliminando usuario: ${id}`);
        await firebase_1.db.collection('users').doc(id).delete();
        console.log('✅ [USERDAO] Usuario eliminado correctamente');
    }
}
exports.UserDAO = UserDAO;

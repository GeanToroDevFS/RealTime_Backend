import { db } from '../config/firebase';
import { User, UserCreate, UserUpdate } from '../models/User';

/**
 * UserDAO
 *
 * Data Access Object responsible for CRUD operations on the "users" collection in Firestore.
 * This class encapsulates Firestore interactions and returns typed User objects used by the service layer.
 */
export class UserDAO {
  /**
   * Create a new user document in Firestore.
   *
   * This method generates a new document with an auto-generated ID, stores the provided
   * user fields (name, lastname, email, age, provider) and returns a User object
   * including the generated id.
   *
   * @param {UserCreate} userData - Data required to create a user (name, lastname, email, age, provider).
   * @returns {Promise<User>} The created User object (includes generated id).
   */
  async createUser(userData: UserCreate): Promise<User> {
    console.log('🔹 [USERDAO] Creando usuario en Firestore...');
    const docId = userData.uid || db.collection('users').doc().id;  // Declarar docId primero
    const userRef = db.collection('users').doc(docId);  // Usar docId
    const user: User = {
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
   * Retrieve a user by their Firestore document ID.
   *
   * @param {string} id - Firestore document ID of the user.
   * @returns {Promise<User | null>} The User object if found, otherwise null.
   */
  async getUserById(id: string): Promise<User | null> {
    console.log(`🔹 [USERDAO] Buscando usuario por ID: ${id}`);
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      console.log('⚠️ [USERDAO] Usuario no encontrado');
      return null;
    }

    const data = userDoc.data()!;
    console.log('✅ [USERDAO] Usuario encontrado');
    return {
      id: userDoc.id,
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      age: data.age,  // Cambiado de birthdate
      provider: data.provider,
    };
  }

  /**
   * Retrieve a user by their email address.
   *
   * Uses a Firestore query to find the first document where the "email" field matches.
   *
   * @param {string} email - Email address to search for.
   * @returns {Promise<User | null>} The User object if a matching document is found, otherwise null.
   */
  async getUserByEmail(email: string): Promise<User | null> {
    console.log(`🔹 [USERDAO] Buscando usuario por email: ${email}`);
    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      console.log('⚠️ [USERDAO] Usuario no encontrado');
      return null;
    }

    const userDoc = userQuery.docs[0];
    const data = userDoc.data()!;
    console.log('✅ [USERDAO] Usuario encontrado');
    return {
      id: userDoc.id,
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      age: data.age,  // Cambiado de birthdate
      provider: data.provider,
    };
  }

  /**
   * Update an existing user's fields.
   *
   * Only provided fields in the updates object are applied. After updating, the method
   * fetches the updated document and returns the full User object.
   *
   * @param {string} id - Firestore document ID of the user to update.
   * @param {UserUpdate} updates - Partial user fields to update (name, lastname, email, age).
   * @returns {Promise<User>} The updated User object.
   */
  async updateUser(id: string, updates: UserUpdate): Promise<User> {
    console.log(`🔹 [USERDAO] Actualizando usuario: ${id}`);
    const userRef = db.collection('users').doc(id);
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.lastname) updateData.lastname = updates.lastname;
    if (updates.email) updateData.email = updates.email;
    if (updates.age) updateData.age = updates.age;  // Cambiado de birthdate

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    const data = updatedDoc.data()!;

    console.log('✅ [USERDAO] Usuario actualizado correctamente');
    return {
      id: updatedDoc.id,
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      age: data.age,  // Cambiado de birthdate
      provider: data.provider,
    };
  }

  /**
   * Delete a user document from Firestore.
   *
   * @param {string} id - Firestore document ID of the user to delete.
   * @returns {Promise<void>} Resolves when deletion completes.
   */
  async deleteUser(id: string): Promise<void> {
    console.log(`🔹 [USERDAO] Eliminando usuario: ${id}`);
    await db.collection('users').doc(id).delete();
    console.log('✅ [USERDAO] Usuario eliminado correctamente');
  }
}
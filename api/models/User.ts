/**
 * Represents a user in the system.
 *
 * @interface User
 * @property {string} id - Firestore document ID or unique user identifier.
 * @property {string} name - User's first name.
 * @property {string} lastname - User's last name.
 * @property {string} email - User's email address (used for login and contact).
 * @property {number} age - User's age in years (calculated or provided as number).
 * @property {string} [provider] - Authentication provider, e.g. 'email', 'google', 'facebook', 'github' (optional).
 */
export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  age: number;  // Cambiado de birthdate: string
  provider?: string; // 'email', 'google', 'facebook', 'github'
}

/**
 * Payload required to create a new user.
 *
 * @interface UserCreate
 * @property {string} name - User's first name.
 * @property {string} lastname - User's last name.
 * @property {string} email - User's email address.
 * @property {string} password - Plain text password (handled securely by auth provider).
 * @property {number} age - User's age in years.
 * @property {string} [provider] - Authentication provider (defaults to 'email' if omitted).
 */
export interface UserCreate {
  name: string;
  lastname: string;
  email: string;
  password: string;
  age: number;  // Cambiado de birthdate: string
  provider?: string;
  uid?: string;  // Agregado
}

/**
 * Partial payload for updating an existing user.
 *
 * Only the fields provided will be updated.
 *
 * @interface UserUpdate
 * @property {string} [name] - Updated first name.
 * @property {string} [lastname] - Updated last name.
 * @property {string} [email] - Updated email address.
 * @property {number} [age] - Updated age in years.
 */
export interface UserUpdate {
  name?: string;
  lastname?: string;
  email?: string;
  age?: number;  // Cambiado de birthdate: string
}
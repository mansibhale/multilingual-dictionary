import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { encryptData, decryptData, encryptFields, decryptFields } from '../utils/encryption';

// Define which fields should be encrypted for user data
const ENCRYPTED_USER_FIELDS = ['bookmarks', 'history'];

/**
 * Save user data (bookmarks & history) with encryption
 * @param {string} userId - User ID
 * @param {object} userData - Object containing bookmarks and history
 * @returns {Promise<void>}
 */
export const saveUserDataEncrypted = async (userId, userData) => {
  try {
    if (!userId) {
      console.warn('⚠️ No userId provided to saveUserDataEncrypted');
      return;
    }

    console.log('💾 Saving encrypted user data for:', userId);

    // Encrypt bookmarks and history
    const encryptedData = encryptFields(userData, ENCRYPTED_USER_FIELDS);
    
    // Add metadata
    const dataToSave = {
      ...encryptedData,
      updatedAt: new Date().toISOString(),
      encrypted: true, // Flag to indicate data is encrypted
    };
    
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, dataToSave, { merge: true });
    
    console.log('✅ User data saved and encrypted successfully');
  } catch (error) {
    console.error('❌ Error saving encrypted user data:', error);
    throw error;
  }
};

/**
 * Get user data (bookmarks & history) with decryption
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Decrypted user data or null
 */
export const getUserDataDecrypted = async (userId) => {
  try {
    if (!userId) {
      console.warn('⚠️ No userId provided to getUserDataDecrypted');
      return null;
    }

    console.log('📥 Getting user data for:', userId);

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log('ℹ️ No user data found, returning empty data');
      return { bookmarks: [], history: [] };
    }
    
    const userData = userSnap.data();
    
    // Check if data is encrypted
    if (userData.encrypted) {
      // Decrypt the sensitive fields
      const decryptedData = decryptFields(userData, ENCRYPTED_USER_FIELDS);
      console.log('✅ User data retrieved and decrypted');
      return decryptedData;
    }
    
    // If not encrypted, return as-is (for backward compatibility)
    console.log('✅ User data retrieved (not encrypted)');
    return userData;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    throw error;
  }
};

/**
 * Update specific user fields with encryption
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateUserDataEncrypted = async (userId, updates) => {
  try {
    if (!userId) {
      console.warn('⚠️ No userId provided to updateUserDataEncrypted');
      return;
    }

    console.log('🔄 Updating encrypted user data for:', userId);

    // Identify which fields need encryption
    const fieldsToEncrypt = Object.keys(updates).filter(key => 
      ENCRYPTED_USER_FIELDS.includes(key)
    );
    
    // Encrypt only the sensitive fields
    const encryptedUpdates = encryptFields(updates, fieldsToEncrypt);
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...encryptedUpdates,
      updatedAt: new Date().toISOString(),
      encrypted: true
    });
    
    console.log('✅ User data updated and encrypted successfully');
  } catch (error) {
    console.error('❌ Error updating user data:', error);
    throw error;
  }
};

export default {
  saveUserDataEncrypted,
  getUserDataDecrypted,
  updateUserDataEncrypted
};
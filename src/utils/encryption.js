import CryptoJS from 'crypto-js';

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.error('⚠️ WARNING: ENCRYPTION_KEY is not set in .env file!');
}

/**
 * Encrypts data using AES encryption
 * @param {string|object} data - Data to encrypt
 * @returns {string} Encrypted string
 */
export const encryptData = (data) => {
  try {
    if (!data) return '';
    
    // Convert objects to JSON string
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Encrypt using AES
    const encrypted = CryptoJS.AES.encrypt(stringData, ENCRYPTION_KEY).toString();
    
    return encrypted;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts AES encrypted data
 * @param {string} encryptedData - Encrypted string
 * @returns {string|object} Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    
    // Decrypt using AES
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Decryption resulted in empty string');
    }
    
    // Try to parse as JSON, return string if it fails
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypts specific fields in an object
 * @param {object} obj - Object containing data
 * @param {array} fieldsToEncrypt - Array of field names to encrypt
 * @returns {object} Object with encrypted fields
 */
export const encryptFields = (obj, fieldsToEncrypt) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const encryptedObj = { ...obj };
  
  fieldsToEncrypt.forEach(field => {
    if (encryptedObj[field] !== undefined && encryptedObj[field] !== null) {
      encryptedObj[field] = encryptData(encryptedObj[field]);
    }
  });
  
  return encryptedObj;
};

/**
 * Decrypts specific fields in an object
 * @param {object} obj - Object with encrypted data
 * @param {array} fieldsToDecrypt - Array of field names to decrypt
 * @returns {object} Object with decrypted fields
 */
export const decryptFields = (obj, fieldsToDecrypt) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const decryptedObj = { ...obj };
  
  fieldsToDecrypt.forEach(field => {
    if (decryptedObj[field]) {
      try {
        decryptedObj[field] = decryptData(decryptedObj[field]);
      } catch (error) {
        console.warn(`⚠️ Could not decrypt field: ${field}`, error);
        // Keep original value if decryption fails
      }
    }
  });
  
  return decryptedObj;
};

export default {
  encryptData,
  decryptData,
  encryptFields,
  decryptFields
};
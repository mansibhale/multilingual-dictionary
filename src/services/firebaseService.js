import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { encryptFields, decryptFields } from '../utils/encryption';

const ENCRYPTED_USER_FIELDS = ['bookmarks', 'history'];

// SAVE USER DATA
export const saveUserDataEncrypted = async (userId, userData) => {
  if (!userId) return;

  const encryptedData = encryptFields(userData, ENCRYPTED_USER_FIELDS);

  await setDoc(
    doc(db, 'users', userId),
    {
      ...encryptedData,
      encrypted: true,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
};

// GET USER DATA
export const getUserDataDecrypted = async (userId) => {
  if (!userId) return null;

  const snap = await getDoc(doc(db, 'users', userId));

  if (!snap.exists()) {
    return { bookmarks: [], history: [] };
  }

  const data = snap.data();

  if (data.encrypted) {
    return decryptFields(data, ENCRYPTED_USER_FIELDS);
  }

  return data;
};

// UPDATE USER DATA
export const updateUserDataEncrypted = async (userId, updates) => {
  if (!userId) return;

  const fieldsToEncrypt = Object.keys(updates).filter(field =>
    ENCRYPTED_USER_FIELDS.includes(field)
  );

  const encryptedUpdates = encryptFields(updates, fieldsToEncrypt);

  await updateDoc(doc(db, 'users', userId), {
    ...encryptedUpdates,
    encrypted: true,
    updatedAt: new Date().toISOString()
  });
};

export default {
  saveUserDataEncrypted,
  getUserDataDecrypted,
  updateUserDataEncrypted
};

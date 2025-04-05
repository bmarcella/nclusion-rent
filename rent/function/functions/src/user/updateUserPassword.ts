import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const updateUserPassword = onCall((request) => {
  const { uid, newPassword } = request.data;

  // Access auth info from request.auth
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  if (!uid || !newPassword) {
    throw new Error('Missing uid or newPassword');
  }

  return admin.auth().updateUser(uid, { password: newPassword })
    .then(() => {
      return { success: true, message: 'Password updated successfully' };
    })
    .catch((error) => {
      console.error('Error updating password:', error);
      throw new Error(error.message);
    });
});

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const updateUserPassword = functions.https.onCall(
  async (data: any, context: any) => {
    // Must be signed in
    if (!context?.auth?.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Sign in required."
      );
    }

    const newPassword = String(data?.newPassword ?? "").trim();

    if (newPassword.length < 6) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Password too short."
      );
    }

    const callerUid = context.auth.uid;
    const targetUid = String(data?.uid ?? callerUid).trim();

    // Only allow changing someone else's password if admin
    if (targetUid !== callerUid) {
      const isAdmin = (context.auth.token as any)?.admin === true;
      if (!isAdmin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Not allowed to update another user's password."
        );
      }
    }

    try {
      await admin.auth().updateUser(targetUid, { password: newPassword });
      // Forces re-auth on clients by invalidating refresh tokens
      await admin.auth().revokeRefreshTokens(targetUid);
      return { ok: true };
    } catch (err: any) {
      throw new functions.https.HttpsError(
        "internal",
        err?.message ?? "Update failed."
      );
    }
  }
);

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

type UpdateUserPasswordData = {
  // If omitted, defaults to the caller's UID
  uid?: string;
  newPassword: string;
};

export const updateUserPassword = functions.https.onCall(
  async (data: UpdateUserPasswordData, context) => {
    // 1) Must be signed in
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to update a password."
      );
    }

    // 2) Validate inputs
    const newPassword = (data?.newPassword ?? "").trim();
    if (!newPassword || newPassword.length < 12) {
      // For banking apps you usually enforce stronger rules
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Password must be at least 12 characters."
      );
    }

    // 3) Decide whose password is being updated
    const callerUid = context.auth.uid;
    const targetUid = (data?.uid ?? callerUid).trim();

    // 4) Security: only allow self-update unless caller is admin
    if (targetUid !== callerUid) {
      // Example: require custom claim { admin: true }
      const token = context.auth.token as any;
      if (!token?.admin) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Not allowed to update another user's password."
        );
      }
    }

    // 5) Update password using Admin SDK
    try {
      await admin.auth().updateUser(targetUid, { password: newPassword });

      // Optional: revoke refresh tokens so user must re-login
      await admin.auth().revokeRefreshTokens(targetUid);

      return { ok: true };
    } catch (err: any) {
      throw new functions.https.HttpsError(
        "internal",
        err?.message ?? "Failed to update password."
      );
    }
  }
);

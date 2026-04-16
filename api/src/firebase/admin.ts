import admin from 'firebase-admin'

let app: admin.app.App | null = null

export const getFirebaseApp = (): admin.app.App => {
    if (app) return app
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    if (!raw) {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT is not set. Add the service account JSON (single line) to your .env.',
        )
    }
    let creds: admin.ServiceAccount
    try {
        creds = JSON.parse(raw) as admin.ServiceAccount
    } catch (e) {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT is not valid JSON. Ensure the value is on a single line.',
        )
    }
    app = admin.initializeApp({
        credential: admin.credential.cert(creds),
    })
    return app
}

export const firestore = (): FirebaseFirestore.Firestore =>
    getFirebaseApp().firestore()

export const firebaseAuth = (): admin.auth.Auth => getFirebaseApp().auth()

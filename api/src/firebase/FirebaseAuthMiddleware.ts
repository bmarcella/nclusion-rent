/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';
import { firebaseAuth, firestore } from './admin';
import { DEvent } from 'src/damba.import';

export interface FirebaseAuthOptions {
  roles?: string[];
  loadProfile?: boolean;
}

const extractBearer = (req: Request): string | null => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
};

const fetchProfileByUid = async (uid: string) => {
  const snap = await firestore()
    .collection('landlord')
    .where('id_user', '==', uid)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as any;
};
export const requireFirebaseAuth = (options: FirebaseAuthOptions = {}) => {
  const { roles, loadProfile = !!options.roles } = options;
  return async (e: DEvent) => {
    const { in: req, out: res, go: next } = e;
    
    const token = extractBearer(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing Firebase ID token' });
    }

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await firebaseAuth().verifyIdToken(token);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.firebaseUser = decoded;
    req.token = token;

    if (loadProfile || roles?.length) {
      const profile = await fetchProfileByUid(decoded.uid);
      if (!profile) {
        return res.status(403).json({ error: 'No profile linked to this user' });
      }
      if (profile.active === false) {
        return res.status(403).json({ error: 'Account is inactive' });
      }
      req.userProfile = profile;

      if (roles?.length) {
        const authority: string[] = Array.isArray(profile.type_person)
          ? profile.type_person
          : profile.type_person
            ? [profile.type_person]
            : [];
        const ok = authority.some((r) => roles.includes(r));
        if (!ok) {
          return res.status(403).json({ error: 'Insufficient role' });
        }
      }
    }

    next();
  };
};

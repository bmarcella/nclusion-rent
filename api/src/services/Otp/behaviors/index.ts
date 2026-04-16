/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { requireFirebaseAuth } from 'src/firebase/FirebaseAuthMiddleware';
import { createService, DEvent } from '../../../damba.import';
import {
  COLLECTIONS,
  IRequestOtp,
  IRequestOtpStatus,
} from 'src/firebase/collection';
import { randomInt } from 'crypto';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_FROM = process.env.OTP_FROM_EMAIL || 'onboarding@resend.dev';

const generateCode = () =>
  randomInt(0, 1_000_000).toString().padStart(6, '0');
const otpEmailHtml = (code: string, minutes: number) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <h2 style="margin:0 0 12px">Votre code de vérification</h2>
    <p>Utilisez le code ci-dessous pour confirmer votre action. Il expire dans ${minutes} minutes.</p>
    <div style="font-size:28px;letter-spacing:6px;font-weight:700;text-align:center;
                padding:16px;margin:16px 0;background:#f3f4f6;border-radius:8px">
      ${code}
    </div>
    <p style="color:#6b7280;font-size:12px">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
  </div>
`;
const api = createService('/otp');
api.DPost(
  '/createOtpForRequest',
  async (e: DEvent) => {
    const uid = e.in.firebaseUser!.uid;
    const email = e.in.firebaseUser!.email;
    if (!email) {
      return e.out
        .status(400)
        .json({ error: true, message: 'No email on account' });
    }

    const { request_id } = e.in.body ?? {};
    if (typeof request_id !== 'string' || !request_id.trim()) {
      return e.out
        .status(400)
        .json({ error: true, message: 'request_id is required' });
    }

    const db = e.in.firestore;

    const requestSnap = await db
      .collection(COLLECTIONS.EXPENSE_REQUEST)
      .doc(request_id)
      .get();
    if (!requestSnap.exists) {
      return e.out
        .status(404)
        .json({ error: true, message: 'Request not found' });
    }
    const requestData = requestSnap.data() as any;
    if (requestData?.createdBy && requestData.createdBy !== uid) {
      return e.out
        .status(403)
        .json({ error: true, message: 'Not your request' });
    }

    const cooldownCutoff = new Date(Date.now() - OTP_RESEND_COOLDOWN_MS);
    const recent = await db
      .collection(COLLECTIONS.REQUEST_OTP)
      .where('id_user', '==', uid)
      .where('request_id', '==', request_id)
      .where('status', '==', IRequestOtpStatus.PENDING)
      .where('created_at', '>=', cooldownCutoff)
      .limit(1)
      .get();
    if (!recent.empty) {
      return e.out.status(429).json({
        error: true,
        message:
          'An OTP was sent recently. Please wait before requesting another.',
      });
    }

    const now = new Date();
    const otp: IRequestOtp = {
      request_id,
      id_user: uid,
      email,
      code: generateCode(),
      expires_at: new Date(now.getTime() + OTP_TTL_MS),
      created_at: now,
      status: IRequestOtpStatus.PENDING,
    };

    const ref = db.collection(COLLECTIONS.REQUEST_OTP).doc();
    await ref.set({ ...otp, id: ref.id });

    try {
      await e.in.resend.emails.send({
        from: OTP_FROM,
        to: email,
        subject: 'Votre code de vérification - ('+ request_id+ ')',
        html: otpEmailHtml(otp.code, Math.round(OTP_TTL_MS / 60000)),
      });
    } catch (err) {
      await ref.delete();
      return e.out.status(502).json({
        error: true,
        message: 'Failed to send OTP email',
      });
    }

    return e.out.json({
      error: false,
      otpId: ref.id,
      expiresAt: otp.expires_at.toISOString(),
      message: 'OTP sent',
    });
  },
  {},
  [requireFirebaseAuth()],
);

api.DPost(
  '/verifyOtpForRequest',
  async (e: DEvent) => {
    const uid = e.in.firebaseUser!.uid;
    const { request_id, code } = e.in.body ?? {};
    if (typeof request_id !== 'string' || !request_id.trim()) {
      return e.out
        .status(400)
        .json({ error: true, message: 'request_id is required' });
    }
    if (typeof code !== 'string' || !code.trim()) {
      return e.out
        .status(400)
        .json({ error: true, message: 'code is required' });
    }

    const db = e.in.firestore;
    const snap = await db
      .collection(COLLECTIONS.REQUEST_OTP)
      .where('id_user', '==', uid)
      .where('request_id', '==', request_id)
      .where('code', '==', code.trim())
      .where('status', '==', IRequestOtpStatus.PENDING)
      .limit(1)
      .get();

    if (snap.empty) {
      return e.out.status(400).json({ error: true, message: 'Invalid code' });
    }

    const doc = snap.docs[0];
    const data = doc.data() as IRequestOtp;
    const expiresAt =
      (data.expires_at as any)?.toDate?.() ??
      (data.expires_at instanceof Date
        ? data.expires_at
        : new Date(data.expires_at as any));

    if (expiresAt.getTime() <= Date.now()) {
      await doc.ref.update({ status: IRequestOtpStatus.EXPIRED });
      return e.out
        .status(400)
        .json({ error: true, message: 'Code has expired' });
    }

    await doc.ref.update({ status: IRequestOtpStatus.USED });

    return e.out.json({ error: false, message: 'OTP verified' });
  },
  {},
  [requireFirebaseAuth()],
);

export default api.done();

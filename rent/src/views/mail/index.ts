import { Resend } from "resend";
const key = import.meta.env.VITE_RESEND;
export const resend = new Resend(key);
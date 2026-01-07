import { EmailReceiver } from "@/views/mail/MailSender";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
type MailResult = {
    invalidEmails: string[];
    totalInvalid: number;
    sent: number; // how many batches were sent
};

type MailState = {
    isSending: boolean;
    error: string | null;
    lastResult: MailResult | null;
};
export type SendMailPayload = {
    subject: string;
    template: string; // html string with {{var}} placeholders
    from?: string;
    receivers: EmailReceiver[];
    escapeHtml?: boolean; // default true
};

type MailContextValue = MailState & {
    sendMail: (payload: SendMailPayload) => Promise<MailResult>;
    reset: () => void;
};

const MailContext = createContext<MailContextValue | null>(null);

export function MailProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent overlapping sends
    const inFlight = useRef(false);

    const reset = useCallback(() => {
        setIsSending(false);
        setError(null);
        inFlight.current = false;
    }, []);

    const sendMail = useCallback(
        async (payload: SendMailPayload): Promise<MailResult> => {
            if (inFlight.current) throw new Error("A send operation is already in progress.");

            setIsSending(true);
            setError(null);
            inFlight.current = true;

            try {
                const from = payload.from ?? "AjiMobil <mail@ajimobil.com>";
                const escape = payload.escapeHtml ?? true;

                const invalidEmails: string[] = [];
                const batches: Array<{
                    from: string;
                    to: string[];
                    subject: string;
                    html: string;
                }> = [];


                if (batches.length === 0) {
                    throw new Error("No batches to send");
                }

                return null;
            } catch (e: any) {
                const msg = e?.message ? String(e.message) : "Unknown mail error";
                setError(msg);
                throw e;
            } finally {
                setIsSending(false);
                inFlight.current = false;
            }
        },
        []
    );

    const value: MailContextValue = useMemo(
        () => ({ isSending, error, sendMail, reset }),
        [isSending, error, sendMail, reset]
    );

    return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMail() {
    const ctx = useContext(MailContext);
    if (!ctx) throw new Error("useMail must be used within a MailProvider");
    return ctx;
}
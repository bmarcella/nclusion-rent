import { resend } from ".";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export type TemplateVars = Record<
    string,
    string | number | boolean | null | undefined
>;

export const DefaultEmailFrom = "AjiMobil <mail@ajimobil.com>";

export interface BatchEmail {
    from: string;
    to: string[];
    subject: string;
    html: string;
}

export interface EmailReceiver {
    email: string;
    vars: TemplateVars;
}

export default class MailSender {
    private invalidEmails: string[] = [];
    private batches: BatchEmail[] = [];

    constructor(
        private readonly subject: string,
        private readonly template: string,
        private readonly from: string = DefaultEmailFrom
    ) { }

    private isValidEmail(email: string): boolean {
        return emailRegex.test(email);
    }

    private escapeHtml(value: string): string {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    private renderEmailTemplate(
        template: string,
        vars: TemplateVars,
        options?: { escape?: boolean }
    ): string {
        const shouldEscape = options?.escape ?? true;

        return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key: string) => {
            const raw = vars[key];
            if (raw === null || raw === undefined) return match;

            const str = String(raw);
            return shouldEscape ? this.escapeHtml(str) : str;
        });
    }

    addReceivers(receivers: EmailReceiver[] | EmailReceiver) {
        // reset per run
        this.invalidEmails = [];
        this.batches = [];

        const list = Array.isArray(receivers) ? receivers : [receivers];

        for (const r of list) {
            if (!this.isValidEmail(r.email)) {
                this.invalidEmails.push(r.email);
                continue;
            }

            const html = this.renderEmailTemplate(this.template, r.vars);

            this.batches.push({
                from: this.from,
                to: [r.email],
                subject: this.subject,
                html,
            });
        }

        return { emails: this.invalidEmails, total: this.invalidEmails.length };
    }

    async done(): Promise<void> {
        if (!this.batches.length) {
            throw new Error("No batches to send");
        }

        await resend.batch.send(this.batches);
    }
}

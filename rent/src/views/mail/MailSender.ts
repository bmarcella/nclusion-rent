import { Proprio } from "../Entity";
import { getRequestStatusLabelFR } from "../request/entities/AuthRequest";
import { IRequest } from "../request/entities/IRequest";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export type TemplateVars = Record<
    string,
    string | number | boolean | null | undefined
>;

export const DefaultEmailFrom = "AjiMobil <admin@mail.ajimobil.com>";

export interface BatchEmail {
    from: string;
    to: string[];
    subject: string;
    html: string;
}


interface LocalBatchEmailContent {
    to: string[];
    html: string;
}

export interface LocalBatchEmail {
    from: string;
    subject: string;
    contents: LocalBatchEmailContent[]
}
export type TypeEmail = 'new' | 'approved' | "paid" | 'reject' | 'canceled' | 'reminder' | 'ac';

export interface EmailReceiver {
    email: string;
    vars: TemplateVars;
}

export interface MailData {
    request: IRequest,
    landlords: Proprio[],
    type: TypeEmail,
    proprio: Proprio,
    action?: {
        madeAt?: Date
        madeBy?: string,
        oldStatus?: string
    }

}

export default class MailSender {
    private invalidEmails: string[] = [];
    private batches: LocalBatchEmailContent[] = [];
    private data!: MailData;

    constructor(
        private readonly subject: string,
        private readonly template: string,
        private readonly from: string = DefaultEmailFrom
    ) { }

    private isValidEmail(email: string): boolean {
        return emailRegex.test(email);
    }

    addData(data: MailData) {
        this.data = data;
        return this.prepareData();
    }

    toDate(date: any): string {
        if (!date) return '';

        // Firestore Timestamp
        if (typeof date.toDate === 'function') {
            return date.toDate().toDateString();
        }

        // JS Date
        if (date instanceof Date) {
            return date.toDateString();
        }

        // String / number
        return new Date(date).toDateString();
    }



    private prepareData() {
        const emcs: EmailReceiver[] = [];
        const request = this.data.request;
        const proprio = this.data.proprio;
        const action = this.data?.action;
        for (const p of this.data.landlords) {
            const text = request?.comments?.[request.comments?.length - 1]?.text || '';
            const emc: EmailReceiver = {
                email: p.email!,
                vars: {
                    fullName: p.fullName,
                    type_request: request.requestType,
                    amount: request.amount,
                    currency: request.general?.currency,
                    createdAt: this.toDate(request.createdAt),
                    createdBy: proprio.fullName,
                    beneficiary: request.general?.beneficiaryName,
                    reqUrl: `${window.location.origin}/request/${request.id}`,
                    reqUrlText: "Voir la requête",
                    status: getRequestStatusLabelFR(request.status as any),
                    oldStatus: getRequestStatusLabelFR(action?.oldStatus || request.status as any),
                    madeAt: this.toDate(request.updatedAt),
                    madeBy: proprio.fullName,
                    paymentMethod: request.general?.paymentMethod,
                    rejectionReason: text
                }
            }
            emcs.push(emc);
        }
        if (emcs.length > 0) {
            const report = this.addReceivers(emcs);
            const contents = this.done();
            const batches: LocalBatchEmail = {
                from: this.from,
                subject: this.subject,
                contents: contents
            }
            return { report, batches }
        } else {
            return {
                report: { emails: [], total: 0 }, batches: undefined
            }
        }
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

    private addReceivers(receivers: EmailReceiver[] | EmailReceiver) {
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
                to: [r.email],
                html,
            });
        }
        return { emails: this.invalidEmails, total: this.invalidEmails.length };
    }

    private done(): LocalBatchEmailContent[] {
        if (!this.batches.length) {
            throw new Error("No batches to send");
        }
        return this.batches;
    }
}

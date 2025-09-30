interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html: string;
}
export declare const sendEmail: ({ to, subject, text, html, }: SendEmailParams) => Promise<void>;
export {};
//# sourceMappingURL=email.d.ts.map
import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string, role: string) {
    const verificationUrl = `https://your-app.com/verify-email?token=${token}`;
    const subject = `Verifikasi Email untuk ${role}`;
    const html = `
        <p>Silahkan klik link berikut untuk verifikasi email dan set password Anda:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Link ini hanya berlaku 1 jam setelah pembuatan.</p>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_SENDER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    try {
        await transporter.sendMail({
            from: `"YourApp" <${process.env.MAIL_SENDER}>`,
            to: email,
            subject,
            html,
        });
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
}

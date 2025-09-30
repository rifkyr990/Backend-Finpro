"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async ({ to, subject, text, html, }) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_SENDER,
            pass: process.env.MAIL_PASSWORD,
        },
        tls: {
            // !! DANGER: Only for development, not safe for production !!
            rejectUnauthorized: false,
        },
    });
    const mailOptions = {
        from: process.env.MAIL_SENDER, // Alamat pengirim
        to,
        subject,
        text,
        html,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map
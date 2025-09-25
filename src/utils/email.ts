import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailParams) => {
  const transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

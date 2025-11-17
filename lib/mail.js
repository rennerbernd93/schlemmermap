import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Passwort an Nutzer senden
export async function sendUserPassword(to, password) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to,
    subject: "Ihr Zugangspasswort",
    text: `Ihr Passwort: ${password}`
  });
}

// Admin benachrichtigen
export async function sendAdminNotification(subject, body) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject,
    text: body
  });
}

export default transporter;

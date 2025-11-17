import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function sendAdminNotification(subject, text) {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject,
    text
  });
}

export async function sendUserPassword(email, password) {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "SchlemmerMap Upload-Passwort",
    text: `Dein Upload-Passwort lautet: ${password}`
  });
}

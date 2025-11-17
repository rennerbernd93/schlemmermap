import prisma from "../../lib/prisma";
import { sendUserPassword } from "../../lib/mail";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "E-Mail fehlt" });

  await sendUserPassword(email, process.env.UPLOAD_USER_PASSWORD || "Mittag123!");

  await prisma.passwordRequest.create({
    data: { email },
  });

  return res.status(200).json({ success: true });
}

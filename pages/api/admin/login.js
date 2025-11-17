import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs"; // ← WICHTIG: bcryptjs statt bcrypt!
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Bitte Benutzername und Passwort eingeben." });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json({ message: "Ungültige Zugangsdaten." });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: "Ungültige Zugangsdaten." });
    }

    const token = Buffer.from(`${admin.username}:${Date.now()}`).toString("base64");

    res.setHeader("Set-Cookie", cookie.serialize("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12 // 12h Login
    }));

    return res.status(200).json({ message: "Login erfolgreich." });

  } catch (error) {
    console.error("Login Fehler:", error);
    return res.status(500).json({ message: "Serverfehler." });
  }
}

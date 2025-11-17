import bcrypt from "bcrypt";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  // Sicherheitscheck
  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // Admin-Daten aus ENV
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Admin credentials missing in ENV" });
  }

  // Prüfung Benutzername
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid username" });
  }

  // Passwort-Vergleich (wenn du kein Hash nutzt → direkter Vergleich)
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  // Setze Login-Cookie (7 Tage gültig)
  res.setHeader(
    "Set-Cookie",
    serialize("admin_session", "logged_in", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    })
  );

  return res.status(200).json({ success: true });
}

// pages/api/admin/login.js
import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { password } = req.body;

  // 🔐 HARDCODED ADMIN PASSWORT
  if (password !== "BSchlemmerAdmin") {
    return res.status(401).json({ error: "Falsches Passwort" });
  }

  // Cookie setzen (gültig 7 Tage)
  const cookie = serialize("admin_session", "active", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ success: true });
}

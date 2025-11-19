// pages/api/admin/ads/delete.js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID fehlt" });
    }

    // Prüfen, ob die Anzeige existiert
    const ad = await prisma.ad.findUnique({
      where: { id: Number(id) },
    });

    if (!ad) {
      return res.status(404).json({ error: "Anzeige nicht gefunden" });
    }

    // Löschen
    await prisma.ad.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Delete error:", e);
    return res.status(500).json({ error: "Serverfehler" });
  }
}

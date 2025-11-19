// pages/api/admin/ads/extend.js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { id, days } = req.body;

    if (!id || !days) {
      return res.status(400).json({ error: "ID oder Tage fehlen" });
    }

    // Ad laden
    const ad = await prisma.ad.findUnique({
      where: { id: Number(id) },
    });

    if (!ad) {
      return res.status(404).json({ error: "Anzeige nicht gefunden" });
    }

    // Startpunkt bestimmen (entweder bestehendes Ablaufdatum oder jetzt)
    let baseDate = ad.expiresAt ? new Date(ad.expiresAt) : new Date();

    // Wenn abgelaufen → ab heute verlängern
    const now = new Date();
    if (baseDate < now) baseDate = now;

    // Neues Ablaufdatum
    const newExpiresAt = new Date(baseDate);
    newExpiresAt.setDate(newExpiresAt.getDate() + Number(days));

    // Update speichern
    const updated = await prisma.ad.update({
      where: { id: Number(id) },
      data: {
        expiresAt: newExpiresAt,
        isActive: true, // wieder aktiv!
        paymentStatus: "paid",
      },
    });

    return res.status(200).json({
      success: true,
      expiresAt: newExpiresAt,
    });
  } catch (e) {
    console.error("Extend error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

// pages/api/ads/create.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed." });
  }

  try {
    const {
      title,
      website,
      radius,
      duration,
      coords,
      paypalId
    } = req.body;

    if (!title || !coords || !coords.lat || !coords.lng) {
      return res.status(400).json({
        error: "Missing required fields: title, coords"
      });
    }

    // --------- Ablaufdatum berechnen ---------
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    // --------- Werbung in DB speichern ---------
    const ad = await prisma.ad.create({
      data: {
        imageUrl: website || "", // später Bild-Upload
        ctaUrl: website || null,
        lat: coords.lat,
        lng: coords.lng,
        radius: Number(radius),
        createdBy: "paypal",
        paymentStatus: paypalId ? "paid" : "pending",
        expiresAt,
        isActive: true
      }
    });

    return res.status(200).json({
      success: true,
      ad,
    });
  } catch (err) {
    console.error("API ERROR /api/ads/create:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

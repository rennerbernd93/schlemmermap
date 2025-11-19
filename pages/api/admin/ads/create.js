// pages/api/admin/ads/create.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      imageUrl,
      ctaUrl,
      lat,
      lng,
      radius,
      days,
      orderId,
      price,
      expiresAt,
    } = req.body;

    if (!imageUrl || !lat || !lng) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ad = await prisma.ad.create({
      data: {
        imageUrl,
        ctaUrl: ctaUrl || null,
        lat,
        lng,
        radius: radius || 50000,
        paymentStatus: "paid",
        isActive: true,
        createdBy: "paypal",
        expiresAt: new Date(expiresAt),
      },
    });

    return res.status(200).json({
      success: true,
      ad,
    });
  } catch (err) {
    console.error("CREATE AD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// pages/api/ads/active.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const ads = await prisma.ad.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      ads: ads.map((ad) => ({
        id: ad.id,
        imageUrl: ad.imageUrl,
        ctaUrl: ad.ctaUrl,
        lat: ad.lat,
        lng: ad.lng,
        radius: ad.radius,
        expiresAt: ad.expiresAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
}

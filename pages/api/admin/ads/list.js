// pages/api/admin/ads/list.js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // Wenn einzelnes Ad gewünscht ist:
    if (id) {
      const ad = await prisma.ad.findUnique({
        where: { id: Number(id) },
      });

      if (!ad) return res.status(404).json({ ok: false, error: "Not found" });

      return res.status(200).json({
        ok: true,
        ad: formatAd(ad),
      });
    }

    // Liste aller Ads
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      ok: true,
      ads: ads.map(formatAd),
    });
  } catch (e) {
    console.error("LIST ERROR:", e);
    res.status(500).json({ ok: false, error: e.toString() });
  }
}

// --------------------------------------
// Anzeige-Formatierer
// --------------------------------------
function formatAd(ad) {
  let status = "pending";
  const now = new Date();

  if (ad.expiresAt && new Date(ad.expiresAt) < now) {
    status = "expired";
  } else if (ad.isActive) {
    status = "active";
  }

  return {
    id: ad.id,
    imageUrl: ad.imageUrl,
    ctaUrl: ad.ctaUrl,
    radius: ad.radius,
    lat: ad.lat,
    lng: ad.lng,
    createdAt: ad.createdAt,
    expiresAt: ad.expiresAt,
    paymentStatus: ad.paymentStatus,
    status,
  };
}

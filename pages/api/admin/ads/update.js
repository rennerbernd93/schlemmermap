// pages/api/admin/ads/update.js
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { id, ctaUrl, radius, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID fehlt" });
    }

    // Status-Mapping
    let isActive = false;
    let expiresAt = undefined;

    if (status === "active") {
      isActive = true;
    } else if (status === "expired") {
      isActive = false;
      expiresAt = new Date(); // abgelaufen ab jetzt
    } else if (status === "pending") {
      isActive = false;
    }

    // Update durchführen
    const updated = await prisma.ad.update({
      where: { id: Number(id) },
      data: {
        ctaUrl: ctaUrl || null,
        radius: radius ? Number(radius) : 50000,
        isActive,
        expiresAt,
      },
    });

    return res.status(200).json({ success: true, ad: updated });
  } catch (e) {
    console.error("Update error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

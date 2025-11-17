import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { action, id } = req.body;
  const adId = Number(id);

  if (!adId) return res.status(400).json({ error: "ID fehlt" });

  if (action === "approve") {
    await prisma.adCampaign.update({
      where: { id: adId },
      data: {
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 Tage
      },
    });
  } else if (action === "delete") {
    await prisma.adCampaign.delete({
      where: { id: adId },
    });
  } else {
    return res.status(400).json({ error: "Ungültige Aktion" });
  }

  res.status(200).json({ success: true });
}

import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, action } = req.body;

  if (!id || !action) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    if (action === "approve") {
      await prisma.adCampaign.update({
        where: { id },
        data: { isActive: true },
      });
      return res.status(200).json({ success: true });
    }

    if (action === "deactivate") {
      await prisma.adCampaign.update({
        where: { id },
        data: { isActive: false },
      });
      return res.status(200).json({ success: true });
    }

    if (action === "delete") {
      await prisma.adCampaign.delete({
        where: { id },
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error("API /admin/ads error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

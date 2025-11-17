import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { action, id } = req.body;
  const restaurantId = Number(id);

  if (!restaurantId) return res.status(400).json({ error: "ID fehlt" });

  if (action === "approve") {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { active: true },
    });
  } else if (action === "deactivate") {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { active: false },
    });
  } else if (action === "delete") {
    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });
  } else {
    return res.status(400).json({ error: "Ung�ltige Aktion" });
  }

  res.status(200).json({ success: true });
}

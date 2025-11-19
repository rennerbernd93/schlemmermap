import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const admin = req.cookies.admin;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.body;

  await prisma.restaurant.delete({ where: { id: Number(id) } });

  res.json({ success: true });
}

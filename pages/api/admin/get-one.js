import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const admin = req.cookies.admin;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: Number(id) }
  });

  res.json(restaurant);
}

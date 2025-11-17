import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const restaurants = await prisma.restaurant.findMany({
    where: { active: true },
  });

  res.status(200).json(restaurants);
}

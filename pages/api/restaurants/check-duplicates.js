import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "POST only" });

  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat/lng" });
  }

  const radius = 0.00025; // ~ 25 Meter

  const matches = await prisma.restaurant.findMany({
    where: {
      latitude: {
        gte: lat - radius,
        lte: lat + radius,
      },
      longitude: {
        gte: lng - radius,
        lte: lng + radius,
      },
    },
  });

  if (matches.length > 0) {
    return res.json({ exists: true, restaurant: matches[0] });
  }

  return res.json({ exists: false });
}

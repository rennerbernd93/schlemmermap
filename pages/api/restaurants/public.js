// pages/api/restaurants/public.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(restaurants);
  } catch (err) {
    console.error("API /restaurants/public ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

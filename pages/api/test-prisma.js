import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  try {
    const test = await prisma.restaurant.findMany({
      take: 1,
    });

    return res.json({
      ok: true,
      restaurants_found: test.length,
      test,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.toString(),
    });
  }
}

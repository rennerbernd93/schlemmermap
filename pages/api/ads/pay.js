import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).send("Keine Ad-ID übergeben");

  try {
    const ad = await prisma.ad.findUnique({
      where: { id: Number(id) },
    });

    if (!ad) return res.status(404).send("Banner nicht gefunden");

    return res.status(200).json(ad);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Serverfehler");
  }
}

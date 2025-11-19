import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, name, website, phone, menuUrl } = req.body;

    if (!id) return res.status(400).json({ error: "Missing ID" });

    await prisma.restaurant.update({
      where: { id: Number(id) },
      data: {
        name,
        website,
        phone,
        menuUrl,
      },
    });

    return res.redirect("/"); // zurück zur Startseite
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}

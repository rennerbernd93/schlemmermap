import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const { name, website, phone, menuUrl, latitude, longitude } = req.body;

    // --- VALIDATION ---
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    // --- INSERT INTO DB ---
    await prisma.restaurant.create({
      data: {
        name,
        latitude: lat,
        longitude: lng,
        website: website || null,
        phone: phone || null,
        menuUrl: menuUrl || null,
      },
    });

    // Redirect zurück zur Startseite
    return res.redirect(302, "/");
  } catch (err) {
    console.error("Error inserting restaurant:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

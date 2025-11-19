import prisma from "../../../lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const admin = req.cookies.admin;
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  let body = await new Promise((resolve) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => resolve(fields));
  });

  await prisma.restaurant.update({
    where: { id: Number(body.id) },
    data: {
      name: body.name,
      website: body.website,
      phone: body.phone,
      menuUrl: body.menuUrl,
    },
  });

  res.json({ success: true });
}

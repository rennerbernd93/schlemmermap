import formidable from "formidable";
import fs from "fs";
import prisma from "../../../lib/prisma";
import supabase from "../../../lib/supabase";

export const config = {
api: { bodyParser: false },
};

export default function handler(req, res) {
if (req.method !== "POST") return res.status(405).end();

const form = new formidable.IncomingForm();

form.parse(req, async (err, fields, files) => {
try {
if (err) return res.status(500).json({ error: err.message });

const { name, latitude, longitude, ctaUrl } = fields;

const file = files.banner;
if (!file) return res.status(400).json({ error: "Banner fehlt" });

const data = fs.readFileSync(file.filepath);
const key = `banners/${Date.now()}_${file.originalFilename}`;

const { error } = await supabase.storage
.from("banners")
.upload(key, data, {
cacheControl: "3600",
contentType: file.mimetype,
});

if (error) return res.status(500).json({ error: error.message });

const publicUrl = supabase.storage
.from("banners")
.getPublicUrl(key).data.publicUrl;

const ad = await prisma.adCampaign.create({
data: {
imageUrl: publicUrl,
ctaUrl: ctaUrl || null,
lat: Number(latitude),
lng: Number(longitude),
paymentStatus: "pending",
createdBy: "user",
isActive: false,
expiresAt: null,
},
});

return res.status(200).json({ id: ad.id });
} catch (e) {
return res.status(500).json({ error: "Fehler: " + e.message });
}
});
}
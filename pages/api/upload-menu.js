import formidable from "formidable";
import fs from "fs";
import prisma from "../../lib/prisma";
import supabase from "../../lib/supabase";
import { sendAdminNotification } from "../../lib/mail";

export const config = {
api: {
bodyParser: false,
},
};

const USER_PASSWORD = process.env.UPLOAD_USER_PASSWORD || "Mittag123!";
const ADMIN_PASSWORD = process.env.UPLOAD_ADMIN_PASSWORD || "Mittag123()";

export default function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

const form = new formidable.IncomingForm();

form.parse(req, async (err, fields, files) => {
try {
if (err) return res.status(500).json({ error: err.message });

const {
name,
latitude,
longitude,
website,
phone,
password,
menuType,
menuLink,
} = fields;

if (!name || !latitude || !longitude) {
return res.status(400).json({ error: "Name oder Standort fehlt" });
}

if (!password) {
return res.status(400).json({ error: "Passwort fehlt" });
}

let isActive = false;
if (password === ADMIN_PASSWORD) {
isActive = true;
} else if (password === USER_PASSWORD) {
isActive = false;
} else {
return res.status(401).json({ error: "Falsches Passwort" });
}

let menuUrl = null;

if (menuType === "file") {
const file = files.menu;
if (!file) return res.status(400).json({ error: "Datei fehlt" });

const data = fs.readFileSync(file.filepath);
const key = `menus/${Date.now()}_${file.originalFilename}`;

const { error } = await supabase.storage
.from("menus")
.upload(key, data, {
cacheControl: "3600",
contentType: file.mimetype,
});

if (error) return res.status(500).json({ error: error.message });

menuUrl = supabase.storage
.from("menus")
.getPublicUrl(key).data.publicUrl;
}

if (menuType === "link") {
if (!menuLink) return res.status(400).json({ error: "Link fehlt" });
menuUrl = menuLink;
}

if (menuType === "phone") {
// nur Telefonnummer → kein menuUrl
}

const entry = await prisma.restaurant.create({
data: {
name,
latitude: Number(latitude),
longitude: Number(longitude),
menuUrl,
website: website || null,
phone: phone || null,
active: isActive,
},
});

if (!isActive) {
await sendAdminNotification(
"Neuer Mittagstisch wartet auf Freigabe",
`Restaurant: ${name}\nLat: ${latitude}\nLng: ${longitude}`
);
}

return res.status(200).json({
success: true,
message: isActive
? "Upload aktiv – sofort sichtbar"
: "Upload gespeichert – wartet auf Admin-Freigabe",
});
} catch (e) {
console.error(e);
return res.status(500).json({ error: "Serverfehler" });
}
});
}
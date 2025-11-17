import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
const lat = Number(req.query.lat);
const lng = Number(req.query.lng);
const radius = Number(req.query.radius || 50000);

if (!lat || !lng) return res.status(400).json({ error: "Koordinaten fehlen" });

const now = new Date();

const ads = await prisma.adCampaign.findMany({
where: {
isActive: true,
expiresAt: { gt: now },
},
});

function toRad(x) {
return (x * Math.PI) / 180;
}

function haversine(lat1, lon1, lat2, lon2) {
const R = 6371;
const dLat = toRad(lat2 - lat1);
const dLon = toRad(lon2 - lon1);

const a =
Math.sin(dLat / 2) ** 2 +
Math.cos(toRad(lat1)) *
Math.cos(toRad(lat2)) *
Math.sin(dLon / 2) ** 2;

return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const found = ads.filter((ad) => {
const distKm = haversine(lat, lng, ad.lat, ad.lng);
return distKm * 1000 <= radius;
});

res.status(200).json(found);
}
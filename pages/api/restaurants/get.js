// /pages/api/restaurants/get.js

import supabase from "../../../supabase";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing id parameter" });
  }

  // Supabase Query
  const { data, error } = await supabase
    .from("Restaurant")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  // Clean response + map latitude/longitude -> lat/lng
  return res.status(200).json({
    id: data.id,
    name: data.name || "",
    website: data.website || "",
    phone: data.phone || "",
    menuUrl: data.menuUrl || "",
    lat: data.latitude,
    lng: data.longitude,
    active: data.active,
  });
}

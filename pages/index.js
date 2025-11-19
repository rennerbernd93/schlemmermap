"use client";

import { useEffect, useRef, useState } from "react";

// Google Maps Loader
function loadGoogle(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve();

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.onload = resolve;
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Reverse Geocoding über OpenStreetMap Nominatim
async function fetchOSMReverse(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`,
      {
        headers: {
          "User-Agent": "Schlemmermap",
        },
      }
    );

    return await res.json();
  } catch (e) {
    console.error("OSM Reverse Fehler:", e);
    return null;
  }
}

export default function Home() {
  const mapRef = useRef(null);
  const map = useRef(null);

  const userMarker = useRef(null);
  const tempMarker = useRef(null);
  const mode = useRef("search");

  const searchInput = useRef(null);

  // Modal + Form
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: "",
    street: "",
    postcode: "",
    city: "",
    website: "",
    phone: "",
    menuUrl: "",
    lat: null,
    lng: null,
  });

  // INIT
  useEffect(() => {
    initMap();
  }, []);

  async function initMap() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return alert("Google API Key fehlt!");

    await loadGoogle(apiKey);
    await google.maps.importLibrary("maps");

    map.current = new google.maps.Map(mapRef.current, {
      center: { lat: 48.3069, lng: 14.2858 },
      zoom: 13,
      disableDefaultUI: true,
    });

    detectUser();
    loadSupabaseRestaurants();
    setupMapClick();
  }

  // USER LOCATION MARKER
  function detectUser() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (userMarker.current) userMarker.current.setMap(null);

      userMarker.current = new google.maps.Marker({
        map: map.current,
        position: { lat, lng },
        icon: {
          url: "/user-pin.svg",
          scaledSize: new google.maps.Size(42, 42),
        },
      });
    });
  }

  // SUPABASE LOAD
  async function loadSupabaseRestaurants() {
    const res = await fetch("/api/restaurants/public");
    const list = await res.json();

    list.forEach((rest) => {
      const m = new google.maps.Marker({
        map: map.current,
        position: { lat: rest.lat, lng: rest.lng },
        icon: {
          url: "/restaurant-pin.svg",
          scaledSize: new google.maps.Size(36, 36),
        },
      });

      m.addListener("click", () => openRestaurant(rest.id));
    });
  }

  // SUPABASE DETAIL
  async function openRestaurant(id) {
    const res = await fetch(`/api/restaurants/get?id=${id}`);
    const item = await res.json();

    setForm({
      id: item.id,
      name: item.name,
      street: item.street || "",
      postcode: item.postcode || "",
      city: item.city || "",
      website: item.website,
      phone: item.phone,
      menuUrl: item.menuUrl,
      lat: item.lat,
      lng: item.lng,
    });

    setShowModal(true);
  }

  // MAP CLICK → ADD MODUS
  function setupMapClick() {
    map.current.addListener("click", async (e) => {
      if (mode.current !== "add") return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (tempMarker.current) tempMarker.current.setMap(null);

      tempMarker.current = new google.maps.Marker({
        map: map.current,
        position: { lat, lng },
        draggable: true,
      });

      // 🚀 OpenStreetMap Reverse Geocoding
      const osm = await fetchOSMReverse(lat, lng);

      const street =
        osm?.address?.road + " " + (osm?.address?.house_number || "");
      const postcode = osm?.address?.postcode || "";
      const city =
        osm?.address?.city ||
        osm?.address?.town ||
        osm?.address?.village ||
        "";

      setForm({
        id: null,
        name: "", // Restaurantname nicht automatisch
        street: street || "",
        postcode,
        city,
        website: "",
        phone: "",
        menuUrl: "",
        lat,
        lng,
      });

      setShowModal(true);
    });
  }

  // SAVE ENTRY
  async function saveEntry(e) {
    e.preventDefault();

    await fetch("/api/restaurants/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Gespeichert!");

    setShowModal(false);
    mode.current = "search";

    if (tempMarker.current) tempMarker.current.setMap(null);
    loadSupabaseRestaurants();
  }

  return (
    <div style={{ padding: 0, margin: 0 }}>

      {/* LOGO */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <img src="/logo.png" style={{ width: 180 }} />
      </div>

      {/* MAP CONTAINER */}
      <div
        style={{
          position: "relative",
          height: "72vh",
          borderRadius: 12,
          overflow: "hidden",
          margin: "20px",
        }}
      >
        {/* ADD BUTTON */}
        <button
          onClick={() => {
            mode.current = "add";
            alert("Add-Modus aktiviert – bitte auf die Karte klicken.");
          }}
          style={{
            position: "absolute",
            bottom: 25,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 28px",
            background: "black",
            color: "white",
            borderRadius: 30,
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            zIndex: 20,
          }}
        >
          ➕ Mittagstisch hinzufügen
        </button>

        {/* USER LOCATE */}
        <button
          onClick={detectUser}
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            padding: 10,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            zIndex: 20,
          }}
        >
          📍
        </button>

        {/* MAP */}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "white",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <h2>{form.id ? "Eintrag bearbeiten" : "Neuen Eintrag hinzufügen"}</h2>

            <form onSubmit={saveEntry}>

              <label>Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: "100%", padding: 10, marginBottom: 10 }}
              />

              <label>Straße</label>
              <input
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                style={{ width: "100%", padding: 10, marginBottom: 10 }}
              />

              <label>PLZ</label>
              <input
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                style={{ width: "100%", padding: 10, marginBottom: 10 }}
              />

              <label>Stadt</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={{ width: "100%", padding: 10, marginBottom: 10 }}
              />

              <label>Website</label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                style={{ width: "100%", padding: 10, marginBottom: 10 }}
              />

              <label>Telefon</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ width: "100%", padding: 10, marginBottom: 10 }}
              />

              <label>Speisekarte URL</label>
              <input
                value={form.menuUrl}
                onChange={(e) => setForm({ ...form, menuUrl: e.target.value })}
                style={{ width: "100%", padding: 10, marginBottom: 20 }}
              />

              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "black",
                  color: "white",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                Speichern
              </button>
            </form>

            <button
              onClick={() => {
                setShowModal(false);
                mode.current = "search";
              }}
              style={{
                width: "100%",
                marginTop: 10,
                padding: 12,
                background: "#ddd",
                borderRadius: 8,
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
useEffect(() => {
  if (!banners || banners.length === 0) return;

  const interval = setInterval(() => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  }, 10000); // 10 Sekunden

  return () => clearInterval(interval);
}, [banners]);

export default function MapWithBanners() {
const mapRef = useRef(null);
const inputRef = useRef(null);
const [userLocation, setUserLocation] = useState({
lat: 52.52,
lng: 13.405,
});
const [banners, setBanners] = useState([]);
const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
const STAR_ICON = "https://maps.google.com/mapfiles/kml/shapes/star.png";

useEffect(() => {
  // Script laden + initMap
}, []); // nur einmal beim Mount

const s = document.createElement("script");
s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_KEY}&libraries=places`;
s.async = true;
s.defer = true;
s.onload = initMap;
document.head.appendChild(s);

async function initMap() {
const m = new window.google.maps.Map(mapRef.current, {
center: userLocation,
zoom: 12,
});

const autocomplete = new window.google.maps.places.Autocomplete(
inputRef.current
);
autocomplete.bindTo("bounds", m);
autocomplete.addListener("place_changed", () => {
const place = autocomplete.getPlace();
if (!place.geometry) return;
m.setCenter(place.geometry.location);
m.setZoom(15);
});

if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition((pos) => {
const loc = {
lat: pos.coords.latitude,
lng: pos.coords.longitude,
};
setUserLocation(loc);
m.setCenter(loc);
});
}

// Restaurants laden
const res = await fetch("/api/restaurants/public");
const restaurants = await res.json();

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

const withDistance = restaurants.map((r) => ({
...r,
distance: haversine(
userLocation.lat,
userLocation.lng,
r.latitude,
r.longitude
),
}));
const nearest = withDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);

const bounds = new window.google.maps.LatLngBounds();

nearest.forEach((r) => {
const pos = { lat: Number(r.latitude), lng: Number(r.longitude) };
const marker = new window.google.maps.Marker({
position: pos,
map: m,
title: r.name,
icon: STAR_ICON,
});
bounds.extend(marker.getPosition());

const infoContent = `
<div style="min-width:220px;">
<strong>${r.name}</strong><br/>
<span style="font-size:12px;color:#666;">Entfernung: ${r.distance.toFixed(
2
)} km</span><br/><br/>
${
r.menuUrl
? `<a href="${r.menuUrl}" target="_blank">Speisekarte öffnen</a><br/>`
: ""
}
${
r.website
? `<a href="${r.website}" target="_blank">Website des Restaurants</a><br/>`
: ""
}
${
r.phone
? `<a href="tel:${r.phone}">Mittagstisch telefonisch erfragen</a><br/>`
: ""
}
<a href="https://www.google.com/maps/dir/?api=1&destination=${
r.latitude
},${r.longitude}" target="_blank">Route mit Google Maps starten</a>
</div>
`;
const info = new window.google.maps.InfoWindow({ content: infoContent });
marker.addListener("click", () => info.open(m, marker));
});

if (nearest.length > 0) m.fitBounds(bounds);

// Banner laden
fetchBanners(userLocation.lat, userLocation.lng);
}

async function fetchBanners(lat, lng) {
  let radius = 50000;
  let found = [];

  while (found.length === 0 && radius <= 1000000) {
    const res = await fetch(
      `/api/ads/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    const data = await res.json();
    found = data;
    radius *= 2;
  }

  if (!found || found.length === 0) {
    setBanners([]);
    return;
  }

  // Entfernung für jedes Banner berechnen
  const withDistance = found.map((ad) => ({
    ...ad,
    distance: haversine(lat, lng, ad.lat, ad.lng),
  }));

  // Nächste zuerst
  withDistance.sort((a, b) => a.distance - b.distance);

  setBanners(withDistance);      // keine Begrenzung, wir rotieren
  setCurrentBannerIndex(0);      // mit erstem Banner starten
}


return () => {
try {
document.head.removeChild(s);
} catch (e) {}
};
}, [userLocation]);

return (
  <div>
    <input
      ref={inputRef}
      placeholder="Ort suchen"
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto 10px auto",
        display: "block",
        padding: 8,
      }}
    />

    {/* Banner-Bereich ÜBER der Map */}
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto 10px auto",
        height: 150,
      }}
    >
      {banners.length === 0 && (
        <div>Keine Werbung in deiner Nähe</div>
      )}

      {banners.length > 0 && (
        <a
          href={banners[currentBannerIndex].ctaUrl || "#"}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            position: "relative",
            height: "100%",
          }}
        >
          <img
            src={banners[currentBannerIndex].imageUrl}
            alt="Werbebanner"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8,
            }}
          />

          {/* Entfernung unten rechts */}
          {typeof banners[currentBannerIndex].distance === "number" && (
            <span
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {banners[currentBannerIndex].distance.toFixed(1)} km
            </span>
          )}

          {/* PROMO-Label oben links */}
          {banners[currentBannerIndex].createdBy === "admin" && (
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "orange",
                padding: "4px 8px",
                borderRadius: 4,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              PROMO
            </span>
          )}
        </a>
      )}
    </div>

    {/* Map darunter */}
    <div
      ref={mapRef}
      style={{ width: "100%", height: 500 }}
    />
  </div>
);

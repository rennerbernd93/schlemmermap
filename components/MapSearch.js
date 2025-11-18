"use client";
import { useEffect, useRef, useState } from "react";

export default function MapSearch() {
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const [userLocation, setUserLocation] = useState({
    lat: 52.52,
    lng: 13.405,
  });

  const STAR_ICON = "https://maps.google.com/mapfiles/kml/shapes/star.png";

  useEffect(() => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_KEY}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = initMap;
    document.head.appendChild(s);

    return () => {
      try {
        document.head.removeChild(s);
      } catch (e) {}
    };
  }, []);

  async function initMap() {
    const m = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 12,
    });

    // ----- AUTOCOMPLETE -----
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

    // ----- GEOLOCATION -----
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

    // ----- RESTAURANTS -----
    const res = await fetch("/api/restaurants/public");
    const restaurants = await res.json();

    restaurants.forEach((r) => {
      const pos = { lat: Number(r.latitude), lng: Number(r.longitude) };

      const marker = new window.google.maps.Marker({
        position: pos,
        map: m,
        icon: STAR_ICON,
        title: r.name,
      });

      const info = new window.google.maps.InfoWindow({
        content: `
          <div style="min-width:220px;">
            <strong>${r.name}</strong><br/>
            ${
              r.menuUrl
                ? `<a href="${r.menuUrl}" target="_blank">Speisekarte öffnen</a><br/>`
                : ""
            }
            ${
              r.website
                ? `<a href="${r.website}" target="_blank">Website besuchen</a><br/>`
                : ""
            }
            ${
              r.phone
                ? `<a href="tel:${r.phone}">Anrufen</a><br/>`
                : ""
            }
          </div>
        `,
      });

      marker.addListener("click", () => info.open(m, marker));
    });
  }

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

      <div ref={mapRef} style={{ width: "100%", height: 500 }} />
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";

export default function MapWithBanners({ onUserClick }) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const [userLocation, setUserLocation] = useState({
    lat: 52.52,
    lng: 13.405,
  });

  const [banners, setBanners] = useState([]);
  const [adminBanners, setAdminBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [mode, setMode] = useState("nearby");

  const STAR_ICON = "https://maps.google.com/mapfiles/kml/shapes/star.png";

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

    // ----- CLICK HANDLING -----
    let clickMarker = null;

    m.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // alten Marker entfernen
      if (clickMarker) clickMarker.setMap(null);

      // neuen Marker setzen
      clickMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: m,
        animation: window.google.maps.Animation.DROP,
      });

      // Koordinaten via Callback an Index.js senden
      if (typeof onUserClick === "function") {
        onUserClick({ lat, lng });
      }
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

    // ----- LOAD RESTAURANTS -----
    const res = await fetch("/api/restaurants/public");
    const restaurants = await res.json();

    const withDistance = restaurants.map((r) => ({
      ...r,
      distance: haversine(
        userLocation.lat,
        userLocation.lng,
        r.latitude,
        r.longitude
      ),
    }));

    const nearest = withDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

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
              ? `<a href="${r.website}" target="_blank">Website besuchen</a><br/>`
              : ""
          }
          ${r.phone ? `<a href="tel:${r.phone}">Anrufen</a><br/>` : ""}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${
            r.latitude
          },${r.longitude}" target="_blank">Route starten</a>
        </div>
      `;

      const info = new window.google.maps.InfoWindow({ content: infoContent });
      marker.addListener("click", () => info.open(m, marker));
    });

    if (nearest.length > 0) m.fitBounds(bounds);

    fetchNearbyAds(userLocation.lat, userLocation.lng);
  }

  // ----- AD LOADING -----
  async function fetchNearbyAds(lat, lng) {
    let radius = 50000;
    let found = [];

    while (found.length === 0 && radius <= 1000000) {
      const res = await fetch(
        `/api/ads/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      found = await res.json();
      radius *= 2;
    }

    if (found.length > 0) {
      setBanners(found);
      setMode("nearby");
      return;
    }

    fetchAdminAds();
  }

  async function fetchAdminAds() {
    const res = await fetch("/api/ads/admin");
    const ads = await res.json();

    if (ads && ads.length > 0) {
      setAdminBanners(ads);
      setMode("admin");
      return;
    }

    setMode("google");
  }

  // ----- ROTATE BANNERS -----
  useEffect(() => {
    const list = mode === "nearby" ? banners : adminBanners;

    if (!list || list.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % list.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [mode, banners, adminBanners]);

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

      {/* Banner ABOVE MAP */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto 10px auto",
          height: 150,
        }}
      >
        {mode === "admin" && adminBanners.length > 0 && (
          <a
            href={adminBanners[currentBannerIndex].ctaUrl || "#"}
            target="_blank"
            rel="noreferrer"
            style={{ display: "block", height: "100%" }}
          >
            <img
              src={adminBanners[currentBannerIndex].imageUrl}
              alt="Werbung"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </a>
        )}

        {mode === "nearby" && banners.length > 0 && (
          <a
            href={banners[currentBannerIndex].ctaUrl || "#"}
            target="_blank"
            rel="noreferrer"
            style={{ display: "block", height: "100%" }}
          >
            <img
              src={banners[currentBannerIndex].imageUrl}
              alt="Werbung"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </a>
        )}

        {mode === "google" && (
          <div
            style={{
              width: "100%",
              height: 150,
              background: "#eee",
              borderRadius: 8,
            }}
          >
            {/* Google Ads Placeholder */}
          </div>
        )}
      </div>

      {/* MAP */}
      <div ref={mapRef} style={{ width: "100%", height: 500 }} />

      {/* Banner UNDER MAP */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "10px auto",
          height: 150,
        }}
      >
        {mode === "admin" &&
          adminBanners.length > 1 &&
          adminBanners.map((b, i) => (
            <img
              key={i}
              src={b.imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
                display: i === currentBannerIndex ? "block" : "none",
              }}
            />
          ))}

        {mode === "nearby" &&
          banners.length > 1 &&
          banners.map((b, i) => (
            <img
              key={i}
              src={b.imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
                display: i === currentBannerIndex ? "block" : "none",
              }}
            />
          ))}

        {mode === "google" && (
          <div
            style={{
              width: "100%",
              height: 150,
              background: "#eee",
              borderRadius: 8,
            }}
          />
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";

export default function MapAdd({ onUserClick }) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const [userLocation, setUserLocation] = useState({
    lat: 52.52,
    lng: 13.405,
  });

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

    // ----- Klick auf Karte -----
    let clickMarker = null;

    m.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (clickMarker) clickMarker.setMap(null);

      clickMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: m,
        animation: window.google.maps.Animation.DROP,
      });

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

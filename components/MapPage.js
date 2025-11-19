"use client";

import { useEffect, useRef, useState } from "react";

// -----------------------------------------
// GOOGLE MAPS SCRIPT LOADER
// -----------------------------------------
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    // Falls schon geladen → fertig
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // Falls Script bereits existiert → warten
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.onload = () => resolve(window.google);
      return;
    }

    // Neues Script einfügen
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=beta`;
    script.async = true;
    script.onerror = reject;
    script.onload = () => resolve(window.google);

    document.body.appendChild(script);
  });
}

export default function MapPage() {
  const mapRef = useRef(null);

  const markerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const autocompleteRef = useRef(null);

  const mapInstance = useRef(null);

  const [mode, setMode] = useState("search");
  const [restaurants, setRestaurants] = useState([]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: null,
    lng: null,
  });

  // -----------------------------------------
  // INIT MAP
  // -----------------------------------------
  useEffect(() => {
    init();
  }, [mode]);

  async function init() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("❌ Kein Google API Key gefunden!");
      return;
    }

    // STEP 1: Script laden
    await loadGoogleMaps(apiKey);

    // STEP 2: Libraries laden
    await google.maps.importLibrary("maps");
    await google.maps.importLibrary("places");
    await google.maps.importLibrary("marker");

    // STEP 3: Map erstellen (nur einmal)
    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 48.3069, lng: 14.2858 },
        zoom: 13,
      });
    }

    loadRestaurants();
    setupAutocomplete();
    setUserLocation();

    // Map Click für Add Mode
    mapInstance.current.addListener("click", (e) => {
      if (mode === "add") {
        setAddMarker(e.latLng.lat(), e.latLng.lng());
      }
    });
  }

  // -----------------------------------------
  // RESTAURANTS LADEN
  // -----------------------------------------
  function loadRestaurants() {
    fetch("/api/restaurants/public")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data);

        data.forEach((r) => {
          new google.maps.Marker({
            position: { lat: r.lat, lng: r.lng },
            map: mapInstance.current,
            title: r.name,
          });
        });
      });
  }

  // -----------------------------------------
  // AUTOCOMPLETE SUCHFELD
  // -----------------------------------------
  function setupAutocomplete() {
    if (!autocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(autocompleteRef.current, {
      fields: ["geometry", "formatted_address", "name"],
    });

    ac.addListener("place_changed", () => {
      const p = ac.getPlace();
      if (!p.geometry) return;

      const lat = p.geometry.location.lat();
      const lng = p.geometry.location.lng();

      mapInstance.current.panTo({ lat, lng });
      mapInstance.current.setZoom(15);

      if (markerRef.current) markerRef.current.setMap(null);

      markerRef.current = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
      });

      setForm({
        name: p.name,
        address: p.formatted_address,
        lat,
        lng,
      });
    });
  }

  // -----------------------------------------
  // ADD MARKER BEIM KLICKEN
  // -----------------------------------------
  function setAddMarker(lat, lng) {
    if (markerRef.current) markerRef.current.setMap(null);

    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.current,
      draggable: true,
    });

    setForm((f) => ({ ...f, lat, lng }));

    markerRef.current.addListener("dragend", (e) => {
      setForm((f) => ({
        ...f,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }));
    });
  }

  // -----------------------------------------
  // USER POSITION
  // -----------------------------------------
  function setUserLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      if (userMarkerRef.current) userMarkerRef.current.setMap(null);

      userMarkerRef.current = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstance.current,
        icon: {
          url: "/user-pin.png",
          scaledSize: new google.maps.Size(40, 40),
        },
      });
    });
  }

  // -----------------------------------------
  // LOCATION SPEICHERN
  // -----------------------------------------
  function submitLocation() {
    if (!form.name || !form.lat || !form.lng) {
      alert("Bitte Name und Standort auswählen.");
      return;
    }

    fetch("/api/restaurants/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then(() => {
        alert("Ort gespeichert!");
        setMode("search");
        loadRestaurants();
      });
  }

  return (
    <div>
      {/* MODUS BUTTON */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setMode("search")}>Suchen</button>
        <button onClick={() => setMode("add")}>Ort hinzufügen</button>
      </div>

      {/* SUCHFELD */}
      {mode === "search" && (
        <input
          ref={autocompleteRef}
          type="text"
          placeholder="Restaurant suchen…"
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
      )}

      {/* ADD FORM */}
      {mode === "add" && (
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <input
            type="text"
            placeholder="Adresse"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <button onClick={submitLocation}>Speichern</button>
        </div>
      )}

      {/* KARTE */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: 500,
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
    </div>
  );
}

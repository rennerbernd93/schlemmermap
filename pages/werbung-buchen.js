"use client";
import { useState, useEffect, useRef } from "react";

export default function WerbungBuchen() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [googleObj, setGoogleObj] = useState(null);
  const [map, setMap] = useState(null);

  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(50000); // 50km default
  const [duration, setDuration] = useState(7); // 7 oder 30 Tage
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");

  const [paymentDone, setPaymentDone] = useState(false);

  // ------------------------------
  // GOOGLE MAPS LADEN
  // ------------------------------
  useEffect(() => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_KEY}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => setGoogleObj(window.google);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!googleObj) return;

    const m = new googleObj.maps.Map(mapRef.current, {
      center: { lat: 51, lng: 10 },
      zoom: 6,
      gestureHandling: "greedy",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(m);

    // Klick-Handler
    m.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setCoords({ lat, lng });

      if (markerRef.current) markerRef.current.setMap(null);

      markerRef.current = new googleObj.maps.Marker({
        position: { lat, lng },
        map: m,
        icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
    });
  }, [googleObj]);

  // ------------------------------
  // Preis = immer 1€
  // ------------------------------
  const price = 1;

  // ------------------------------
  // PAYMENT + SERVER CALL
  // ------------------------------
  async function createAdInBackend(paymentId) {
    const res = await fetch("/api/ads/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        website,
        radius,
        duration,
        coords,
        paypalId: paymentId,
      }),
    });

    if (res.ok) {
      setPaymentDone(true);
    } else {
      alert("Fehler beim Speichern der Werbung!");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <a href="/">
          <img
            src="/logo.png"
            alt="Schlemmermap Logo"
            style={{ width: 180, cursor: "pointer" }}
          />
        </a>
      </div>

      <h1 style={{ textAlign: "center" }}>Werbung buchen</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        Wähle Standort, Radius & Laufzeit – Preis bleibt immer gleich: <b>1 €</b>
      </p>

      {/* MAP */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: 400,
          borderRadius: 12,
          marginBottom: 20,
        }}
      ></div>

      {/* FORM */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        }}
      >
        <label style={{ display: "block", marginBottom: 6 }}>
          Titel / Firmenname
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>Website</label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <label>Radius (km)</label>
        <input
          type="range"
          min="5"
          max="200"
          value={radius / 1000}
          onChange={(e) => setRadius(Number(e.target.value) * 1000)}
          style={{ width: "100%" }}
        />
        <p><b>{radius / 1000} km</b> Umkreis</p>

        <label>Laufzeit</label>
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 20,
          }}
        >
          <option value={7}>7 Tage – 1 €</option>
          <option value={30}>30 Tage – 1 €</option>
        </select>

        {/* ------------------- PayPal Button ------------------- */}
        {!paymentDone && (
          <div>
            <h3>Bezahlen (Sandbox):</h3>
            <paypal-buttons
              style={{ layout: "vertical" }}
              createorder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: price.toString(),
                      },
                    },
                  ],
                });
              }}
              onapprove={async (data, actions) => {
                const order = await actions.order.capture();
                await createAdInBackend(order.id);
              }}
            ></paypal-buttons>
          </div>
        )}

        {paymentDone && (
          <div
            style={{
              padding: 20,
              background: "#d4ffd4",
              marginTop: 20,
              borderRadius: 8,
              textAlign: "center",
              fontWeight: "bold",
              color: "#046804",
            }}
          >
            🎉 Zahlung erfolgt! Deine Werbung wurde gespeichert.
          </div>
        )}
      </div>

      {/* PAYPAL SDK LADEN */}
      <script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NAbgqt8OPlsYT4LZx4liHetEm5H1BwmTrc5jZRhmRSKEaZ8nW4b7J2ClOWlerO9GhRr6HDJ9ivPv6E4de}&currency=EUR`}
      ></script>
    </div>
  );
}

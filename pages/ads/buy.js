// pages/ads/buy.js
"use client";
import { useState } from "react";
import PayPalButton from "../../components/PayButton";
import Link from "next/link";

export default function BuyAdPage() {
  const [duration, setDuration] = useState(7); // 7 oder 30 Tage
  const [imageUrl, setImageUrl] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState(50000); // 50km
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = 1.0; // Fixpreis pro Bestellung

  // Wird nach erfolgreicher PayPal-Bezahlung ausgeführt
  async function handlePaymentSuccess(orderId) {
    setLoading(true);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    const res = await fetch("/api/admin/ads/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl,
        ctaUrl,
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(radius),
        days: duration,
        orderId,
        price,
        expiresAt: expiresAt.toISOString(),
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (data.success) {
      setSuccess(true);
    } else {
      alert("Fehler beim Erstellen der Werbung");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <Link href="/">
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: 160,
            margin: "0 auto",
            display: "block",
            cursor: "pointer",
          }}
        />
      </Link>

      <h1 style={{ textAlign: "center", marginTop: 20 }}>
        Werbung buchen
      </h1>

      {success ? (
        <div style={{ padding: 20, background: "#d1ffd1", borderRadius: 10 }}>
          <h2>🎉 Zahlung erfolgreich!</h2>
          <p>Deine Werbung wurde gespeichert.</p>
          <Link
            href="/admin/ads"
            style={{
              display: "block",
              marginTop: 20,
              padding: 12,
              background: "black",
              color: "white",
              textAlign: "center",
              borderRadius: 6,
            }}
          >
            Zur Admin-Übersicht
          </Link>
        </div>
      ) : (
        <>
          {/* Dauer */}
          <label style={{ marginTop: 20, fontWeight: "bold", display: "block" }}>
            Laufzeit wählen
          </label>

          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 5,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          >
            <option value={7}>7 Tage — 1 €</option>
            <option value={30}>30 Tage — 1 €</option>
          </select>

          {/* Bild */}
          <label style={{ marginTop: 20, fontWeight: "bold", display: "block" }}>
            Bild-URL
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          />

          {/* CTA */}
          <label style={{ marginTop: 20, fontWeight: "bold", display: "block" }}>
            Ziel-Link (optional)
          </label>
          <input
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          />

          {/* Standort */}
          <label style={{ marginTop: 20, fontWeight: "bold", display: "block" }}>
            Standort Latitude
          </label>
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="48.137"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          <label style={{ marginTop: 15, fontWeight: "bold", display: "block" }}>
            Standort Longitude
          </label>
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="11.575"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          {/* Radius */}
          <label style={{ marginTop: 20, display: "block", fontWeight: "bold" }}>
            Radius (Meter)
          </label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          {/* PayPal Button */}
          <div style={{ marginTop: 30 }}>
            <PayPalButton
              amount={price}
              onSuccess={handlePaymentSuccess}
            />
          </div>

          {loading && <p>Zahlung wird verarbeitet…</p>}
        </>
      )}
    </div>
  );
}

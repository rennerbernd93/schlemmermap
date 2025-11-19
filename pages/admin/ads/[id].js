// pages/admin/ads/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditAd() {
  const router = useRouter();
  const { id } = router.query;

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  // Felder lokal speichern
  const [ctaUrl, setCtaUrl] = useState("");
  const [radius, setRadius] = useState(50000);
  const [status, setStatus] = useState("pending");

  // Daten laden
  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/ads/list?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAd(data[0]);
        setCtaUrl(data[0].ctaUrl || "");
        setRadius(data[0].radius || 50000);
        setStatus(data[0].status || "pending");
        setLoading(false);
      });
  }, [id]);

  async function saveChanges() {
    await fetch("/api/admin/ads/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ctaUrl,
        radius,
        status
      }),
    });

    alert("Gespeichert!");
    router.push("/admin/ads");
  }

  async function extendAds(days) {
    await fetch("/api/admin/ads/extend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, days }),
    });

    alert(`Um ${days} Tage verlängert!`);
    router.reload();
  }

  async function deleteAd() {
    if (!confirm("Diese Werbung wirklich löschen?")) return;

    await fetch("/api/admin/ads/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    alert("Anzeige gelöscht");
    router.push("/admin/ads");
  }

  if (loading) return <p style={{ padding: 30 }}>Lade…</p>;
  if (!ad) return <p style={{ padding: 30 }}>Anzeige nicht gefunden</p>;

  return (
    <div style={{ padding: 30 }}>
      <button onClick={() => router.push("/admin/ads")}>← zurück</button>

      <h1 style={{ marginTop: 20 }}>Anzeige bearbeiten</h1>

      {/* Banner Vorschau */}
      <img
        src={ad.imageUrl}
        alt="Ad Banner"
        style={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 10,
          marginTop: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      />

      <div style={{ marginTop: 30 }}>
        <label>CTA Link</label>
        <input
          type="text"
          value={ctaUrl}
          onChange={(e) => setCtaUrl(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginTop: 5,
            marginBottom: 20,
          }}
        />

        <label>Radius (Meter)</label>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginTop: 5,
            marginBottom: 20,
          }}
        />

        <label>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginTop: 5,
          }}
        >
          <option value="active">Aktiv</option>
          <option value="pending">Wartend</option>
          <option value="expired">Abgelaufen</option>
        </select>

        {/* SAVE BUTTON */}
        <button
          onClick={saveChanges}
          style={{
            marginTop: 20,
            padding: 12,
            width: "100%",
            borderRadius: 6,
            background: "black",
            color: "white",
            cursor: "pointer",
          }}
        >
          💾 Änderungen speichern
        </button>

        {/* VERLÄNGERN */}
        <h2 style={{ marginTop: 40 }}>⚡ Verlängern</h2>

        <button
          onClick={() => extendAds(7)}
          style={{
            padding: 12,
            width: "100%",
            borderRadius: 6,
            background: "#1976d2",
            color: "white",
            marginTop: 10,
          }}
        >
          +7 Tage
        </button>

        <button
          onClick={() => extendAds(30)}
          style={{
            padding: 12,
            width: "100%",
            borderRadius: 6,
            background: "#512da8",
            color: "white",
            marginTop: 10,
          }}
        >
          +30 Tage
        </button>

        {/* LÖSCHEN */}
        <h2 style={{ marginTop: 40, color: "red" }}>⚠ Löschen</h2>

        <button
          onClick={deleteAd}
          style={{
            padding: 12,
            width: "100%",
            borderRadius: 6,
            background: "#e53935",
            color: "white",
            marginTop: 10,
            cursor: "pointer",
          }}
        >
          🗑 Werbung löschen
        </button>
      </div>
    </div>
  );
}

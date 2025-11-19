// pages/admin/ads/index.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAds() {
    const res = await fetch("/api/admin/ads/list");
    const data = await res.json();
    setAds(data);
    setLoading(false);
  }

  useEffect(() => {
    loadAds();
  }, []);

  function statusBadge(status) {
    switch (status) {
      case "active":
        return (
          <span style={{ background: "#4caf50", padding: "4px 8px", borderRadius: 6, color: "#fff" }}>
            Aktiv
          </span>
        );
      case "pending":
        return (
          <span style={{ background: "#ff9800", padding: "4px 8px", borderRadius: 6, color: "#fff" }}>
            Wartend
          </span>
        );
      case "expired":
        return (
          <span style={{ background: "#f44336", padding: "4px 8px", borderRadius: 6, color: "#fff" }}>
            Abgelaufen
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>📢 Admin – Werbung</h1>
      <p>Alle gebuchten Werbeanzeigen</p>

      {loading && <p>Lade Anzeigen…</p>}

      <div>
        {ads.map((ad) => (
          <Link key={ad.id} href={`/admin/ads/${ad.id}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "#fff",
                padding: 15,
                marginBottom: 15,
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                gap: 15,
                cursor: "pointer",
              }}
            >
              {/* Thumbnail */}
              <img
                src={ad.imageUrl}
                alt="Ad"
                style={{
                  width: 100,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />

              <div style={{ flexGrow: 1 }}>
                <h2 style={{ margin: 0 }}>{ad.ctaUrl ? ad.ctaUrl : "Kein Link"}</h2>

                <p style={{ margin: "5px 0" }}>
                  Radius: {ad.radius ? ad.radius : "—"} m
                </p>

                <p style={{ margin: "5px 0", fontSize: 14 }}>
                  Läuft ab:{" "}
                  <b>
                    {ad.expiresAt
                      ? new Date(ad.expiresAt).toLocaleString()
                      : "—"}
                  </b>
                </p>

                {statusBadge(ad.status)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import prisma from "../../lib/prisma";

export async function getServerSideProps() {
  const ads = await prisma.adCampaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Dates serialisieren für JSON
  const serialized = ads.map((ad) => ({
    ...ad,
    createdAt: ad.createdAt?.toISOString() || null,
    expiresAt: ad.expiresAt?.toISOString() || null,
  }));

  return { props: { initialAds: serialized } };
}

export default function AdminAdsPage({ initialAds }) {
  const [ads, setAds] = useState(initialAds);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  async function handleAction(id, action) {
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Aktion fehlgeschlagen");
      }

      if (action === "delete") {
        setAds((ads) => ads.filter((a) => a.id !== id));
      } else {
        setAds((ads) =>
          ads.map((a) =>
            a.id === id
              ? {
                  ...a,
                  isActive: action === "approve",
                }
              : a
          )
        );
      }
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        Admin – Werbekampagnen
      </h1>
      <p style={{ marginBottom: "16px", color: "#555" }}>
        Hier kannst du Banner-Kampagnen freischalten, deaktivieren oder
        löschen.
      </p>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 12px",
            borderRadius: "6px",
            background: "#fee2e2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {ads.length === 0 ? (
        <p>Keine Kampagnen vorhanden.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                ID
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Titel
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Status
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Erstellt
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.id}>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {ad.id}
                </td>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {ad.title || ad.imageUrl || "(ohne Titel)"}
                </td>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {ad.isActive ? "Aktiv" : "Inaktiv"}
                </td>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {ad.createdAt
                    ? new Date(ad.createdAt).toLocaleString("de-DE")
                    : "-"}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    padding: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  <button
                    onClick={() => handleAction(ad.id, "approve")}
                    disabled={loadingId === ad.id}
                    style={{
                      marginRight: 8,
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: "none",
                      background: "#10b981",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Freischalten
                  </button>
                  <button
                    onClick={() => handleAction(ad.id, "deactivate")}
                    disabled={loadingId === ad.id}
                    style={{
                      marginRight: 8,
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: "none",
                      background: "#f59e0b",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Deaktivieren
                  </button>
                  <button
                    onClick={() => handleAction(ad.id, "delete")}
                    disabled={loadingId === ad.id}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

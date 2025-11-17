import { useState } from "react";
import prisma from "../../lib/prisma";

export async function getServerSideProps() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = restaurants.map((r) => ({
    ...r,
    createdAt: r.createdAt?.toISOString() || null,
  }));

  return { props: { initialRestaurants: serialized } };
}

export default function AdminRestaurantsPage({ initialRestaurants }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  async function handleAction(id, action) {
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Aktion fehlgeschlagen");
      }

      if (action === "delete") {
        setRestaurants((list) => list.filter((r) => r.id !== id));
      } else {
        const active = action === "approve";
        setRestaurants((list) =>
          list.map((r) => (r.id === id ? { ...r, active } : r))
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
        Admin – Restaurants
      </h1>
      <p style={{ marginBottom: "16px", color: "#555" }}>
        Hier kannst du Restaurants freischalten, deaktivieren oder löschen.
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

      {restaurants.length === 0 ? (
        <p>Keine Restaurants vorhanden.</p>
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
                Name
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Aktiv
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
            {restaurants.map((r) => (
              <tr key={r.id}>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {r.id}
                </td>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {r.name}
                </td>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {r.active ? "Ja" : "Nein"}
                </td>
                <td
                  style={{ borderBottom: "1px solid #f3f4f6", padding: 8 }}
                >
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString("de-DE")
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
                    onClick={() => handleAction(r.id, "approve")}
                    disabled={loadingId === r.id}
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
                    onClick={() => handleAction(r.id, "deactivate")}
                    disabled={loadingId === r.id}
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
                    onClick={() => handleAction(r.id, "delete")}
                    disabled={loadingId === r.id}
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

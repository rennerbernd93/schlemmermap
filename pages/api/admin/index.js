import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/admin/restaurants").then(r => r.json());
    setRestaurants(res);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function deleteRestaurant(id) {
    if (!confirm("Restaurant wirklich löschen?")) return;

    await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ id })
    });

    loadData();
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin – Restaurants verwalten</h1>

      {loading && <p>Lade…</p>}

      {restaurants.map(r => (
        <div
          key={r.id}
          style={{
            background: "#fff",
            padding: 15,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            marginBottom: 20,
          }}
        >
          <h2>{r.name}</h2>
          <p>
            📍 {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
          </p>

          <p>🌐 {r.website || "keine Website"}</p>
          <p>📞 {r.phone || "keine Telefonnummer"}</p>
          <p>📄 {r.menuUrl || "keine Speisekarte"}</p>

          <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
            <a
              href={`/admin/edit/${r.id}`}
              style={{
                padding: "8px 12px",
                background: "#0066ff",
                color: "white",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Bearbeiten
            </a>

            <button
              onClick={() => deleteRestaurant(r.id)}
              style={{
                padding: "8px 12px",
                background: "red",
                color: "white",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

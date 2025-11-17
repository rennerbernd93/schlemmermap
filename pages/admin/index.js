import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [restaurants, setRestaurants] = useState([]);
  const [ads, setAds] = useState([]);

  async function doLogin(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });

    if (res.ok) {
      setLoggedIn(true);
      loadData();
    } else {
      alert("Falsche Zugangsdaten");
    }
  }

  async function loadData() {
    const rest = await fetch("/api/restaurants/public");
    const restData = await rest.json();
    setRestaurants(restData);

    const adsRes = await fetch(
      "/api/ads/nearby?lat=0&lng=0&radius=10000000"
    );
    const adsData = await adsRes.json();
    setAds(adsData);
  }

  async function restaurantAction(id, action) {
    await fetch("/api/admin/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    loadData();
  }

  async function adAction(id, action) {
    await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    loadData();
  }

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
        <h1>Admin Login</h1>

        <form onSubmit={doLogin}>
          <input
            placeholder="Benutzername"
            value={login.username}
            onChange={(e) =>
              setLogin({ ...login, username: e.target.value })
            }
          />

          <input
            placeholder="Passwort"
            type="password"
            value={login.password}
            onChange={(e) =>
              setLogin({ ...login, password: e.target.value })
            }
          />

          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Admin Bereich</h1>

      <button
        onClick={() => setLoggedIn(false)}
        style={{ marginBottom: 20 }}
      >
        Logout
      </button>

      <h2>Restaurants</h2>
      {restaurants.map((r) => (
        <div
          key={r.id}
          style={{ padding: 10, borderBottom: "1px solid #ccc" }}
        >
          <b>{r.name}</b> – aktiv: {r.active ? "Ja" : "Nein"}
          <div style={{ marginTop: 6 }}>
            {!r.active && (
              <button
                onClick={() => restaurantAction(r.id, "approve")}
                style={{ marginRight: 8 }}
              >
                Freigeben
              </button>
            )}
            <button
              onClick={() => restaurantAction(r.id, "deactivate")}
              style={{ marginRight: 8 }}
            >
              Deaktivieren
            </button>
            <button onClick={() => restaurantAction(r.id, "delete")}>
              Löschen
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 30 }}>Werbebanner</h2>
      {ads.map((a) => (
        <div
          key={a.id}
          style={{ padding: 10, borderBottom: "1px solid #ccc" }}
        >
          <b>Banner #{a.id}</b> – aktiv: {a.isActive ? "Ja" : "Nein"}
          <div style={{ marginTop: 6 }}>
            {!a.isActive && (
              <button
                onClick={() => adAction(a.id, "approve")}
                style={{ marginRight: 8 }}
              >
                Aktivieren (7 Tage)
              </button>
            )}
            <button onClick={() => adAction(a.id, "delete")}>
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import dynamic from "next/dynamic";

const MapAdd = dynamic(() => import("../components/MapAdd"), { ssr: false });

export default function AddMenuMap() {
  const [showModal, setShowModal] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);

  function handleUserClick(coords) {
    setClickedLocation(coords);
    setShowModal(true);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      
      {/* LOGO */}
      <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
        <img
          src="/logo.png"
          alt="Schlemmermap Logo"
          style={{ width: 180, maxWidth: "80%", height: "auto" }}
        />
      </div>

      <h2 style={{ textAlign: "center", marginBottom: 10 }}>
        Mittagstisch hinzufügen
      </h2>

      <p style={{ textAlign: "center", marginBottom: 20 }}>
        Klicke auf die Karte, um den Standort des Restaurants auszuwählen.
      </p>

      <MapAdd onUserClick={handleUserClick} />

      {/* ------------ MODAL ------------ */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: "90%",
              maxWidth: 450,
            }}
          >
            <h2>Neues Restaurant</h2>

            <p>
              Standort:
              <br />
              <b>
                {clickedLocation.lat.toFixed(5)},{" "}
                {clickedLocation.lng.toFixed(5)}
              </b>
            </p>

            <form method="POST" action="/api/restaurants/add">
              <input type="hidden" name="latitude" value={clickedLocation.lat} />
              <input type="hidden" name="longitude" value={clickedLocation.lng} />

              <label style={{ display: "block", marginTop: 10 }}>
                Restaurantname
              </label>
              <input
                name="name"
                required
                style={{ width: "100%", padding: 8 }}
              />

              <label style={{ display: "block", marginTop: 10 }}>
                Website (optional)
              </label>
              <input name="website" style={{ width: "100%", padding: 8 }} />

              <label style={{ display: "block", marginTop: 10 }}>
                Telefon (optional)
              </label>
              <input name="phone" style={{ width: "100%", padding: 8 }} />

              <label style={{ display: "block", marginTop: 10 }}>
                Speisekarte URL (optional)
              </label>
              <input name="menuUrl" style={{ width: "100%", padding: 8 }} />

              <button
                type="submit"
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: 12,
                  background: "black",
                  color: "white",
                  borderRadius: 6,
                }}
              >
                Speichern
              </button>
            </form>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 10,
                width: "100%",
                padding: 12,
                borderRadius: 6,
                background: "#ddd",
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

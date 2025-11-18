
import dynamic from "next/dynamic";

const MapSearch = dynamic(() => import("../components/MapSearch"), {
  ssr: false,
});

export default function Home() {
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
        Finde Mittagstische in deiner Nähe
      </h2>

      <p style={{ textAlign: "center", marginBottom: 20 }}>
        Standort verwenden oder Ort eingeben.
      </p>

      {/* Karte ohne Klickfunktion */}
      <MapSearch />

      {/* Link zur neuen Seite */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <a
          href="/add-menu-map"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "black",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          🍽️ Mittagstisch hinzufügen
        </a>
      </div>
    </div>
  );
}

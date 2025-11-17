import { useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Erfolgreich eingeloggt." });
        // Hier könntest du z.B. Router pushen auf /admin/ads
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({
          type: "error",
          message: data.error || "Login fehlgeschlagen.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Serverfehler beim Login." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          minWidth: "320px",
        }}
      >
        <h1 style={{ marginBottom: "16px", fontSize: "24px" }}>
          Admin Login
        </h1>
        <p style={{ marginBottom: "24px", color: "#666", fontSize: "14px" }}>
          Bitte mit Admin-Zugangsdaten einloggen.
        </p>

        <label style={{ display: "block", marginBottom: "12px" }}>
          <span style={{ display: "block", fontSize: "14px", marginBottom: 4 }}>
            Benutzername
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "16px" }}>
          <span style={{ display: "block", fontSize: "14px", marginBottom: 4 }}>
            Passwort
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </label>

        {status && (
          <div
            style={{
              marginBottom: "16px",
              fontSize: "14px",
              color: status.type === "error" ? "#b00020" : "#0a7b25",
            }}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: "6px",
            border: "none",
            background: loading ? "#999" : "#111827",
            color: "#fff",
            cursor: loading ? "default" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Einloggen..." : "Einloggen"}
        </button>
      </form>
    </div>
  );
}

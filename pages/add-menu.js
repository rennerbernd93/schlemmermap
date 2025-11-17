import { useState } from "react";

export default function AddMenuPage() {
const [form, setForm] = useState({
name: "",
latitude: "",
longitude: "",
website: "",
phone: "",
password: "",
menuType: "file", // file | link | phone
menuLink: "",
});

const [file, setFile] = useState(null);
const [status, setStatus] = useState("");

function updateField(e) {
setForm({ ...form, [e.target.name]: e.target.value });
}

async function handleSubmit(e) {
e.preventDefault();
setStatus("Bitte warten...");

const fd = new FormData();
Object.entries(form).forEach(([key, val]) => fd.append(key, val));

if (file && form.menuType === "file") {
fd.append("menu", file);
}

const res = await fetch("/api/upload-menu", {
method: "POST",
body: fd,
});

const json = await res.json();
if (!res.ok) {
setStatus("Fehler: " + (json.error || "Unbekannter Fehler"));
} else {
setStatus(json.message || "Erfolgreich hochgeladen");
}
}

return (
<div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
<h1>Mittagstisch eintragen</h1>
<p>
Du kannst hier einen Mittagstisch als Datei, Link oder telefonisch
eintragen. Bei Upload mit dem normalen Passwort wird dein Eintrag vom
Admin geprüft.
</p>

<form onSubmit={handleSubmit}>
<div style={{ marginBottom: 10 }}>
<label>Name des Restaurants</label>
<input
name="name"
value={form.name}
onChange={updateField}
required
/>
</div>

<div style={{ marginBottom: 10 }}>
<label>Breitengrad (lat)</label>
<input
name="latitude"
value={form.latitude}
onChange={updateField}
required
/>
</div>

<div style={{ marginBottom: 10 }}>
<label>Längengrad (lng)</label>
<input
name="longitude"
value={form.longitude}
onChange={updateField}
required
/>
</div>

<div style={{ marginBottom: 10 }}>
<label>Website des Restaurants (optional)</label>
<input
name="website"
value={form.website}
onChange={updateField}
/>
</div>

<div style={{ marginBottom: 10 }}>
<label>Telefonnummer (für telefonische Speisekarte)</label>
<input name="phone" value={form.phone} onChange={updateField} />
</div>

<hr />

<div style={{ marginBottom: 10 }}>
<label>Art des Mittagstisches</label>
<select
name="menuType"
value={form.menuType}
onChange={updateField}
>
<option value="file">Datei (Bild / PDF)</option>
<option value="link">Link zur Speisekarte</option>
<option value="phone">Telefonisch erfragen</option>
</select>
</div>

{form.menuType === "file" && (
<div style={{ marginBottom: 10 }}>
<label>Speisekarte (Bild / PDF)</label>
<input
type="file"
accept="image/*,application/pdf"
onChange={(e) => setFile(e.target.files[0])}
/>
</div>
)}

{form.menuType === "link" && (
<div style={{ marginBottom: 10 }}>
<label>Link zur Speisekarte</label>
<input
name="menuLink"
value={form.menuLink}
onChange={updateField}
/>
</div>
)}

<div style={{ marginBottom: 10 }}>
<label>Upload-Passwort</label>
<input
name="password"
value={form.password}
onChange={updateField}
required
/>
</div>

<button type="submit">Eintrag hochladen</button>
</form>

<p style={{ marginTop: 16 }}>{status}</p>

<div style={{ marginTop: 20 }}>
<a href="/request-password" style={{ textDecoration: "underline" }}>
Upload-Passwort anfordern
</a>
</div>
</div>
);
}
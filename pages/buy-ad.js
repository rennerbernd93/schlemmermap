import { useState } from "react";

export default function BuyAdPage() {
const [form, setForm] = useState({
name: "",
latitude: "",
longitude: "",
ctaUrl: "",
});

const [banner, setBanner] = useState(null);
const [status, setStatus] = useState("");
const [adId, setAdId] = useState(null);

function updateField(e) {
setForm({ ...form, [e.target.name]: e.target.value });
}

async function handleUpload(e) {
e.preventDefault();
setStatus("Bitte warten�");

const fd = new FormData();
fd.append("name", form.name);
fd.append("latitude", form.latitude);
fd.append("longitude", form.longitude);
fd.append("ctaUrl", form.ctaUrl);
fd.append("banner", banner);

const res = await fetch("/api/ads/upload", {
method: "POST",
body: fd,
});

const json = await res.json();

if (!res.ok) {
setStatus("Fehler: " + (json.error || "Unbekannt"));
} else {
setStatus("Banner hochgeladen � jetzt bezahlen!");
setAdId(json.id);
}
}

function goToPayPal() {
if (!adId) return;
window.location.href = `/api/ads/pay?id=${adId}`;
}

return (
<div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
<h1>Werbebanner buchen</h1>
<p>
Lade hier dein Banner hoch. Es wird den Nutzern in der N�he f�r 7 Tage angezeigt.
</p>

<form onSubmit={handleUpload}>
<div>
<label>Restaurant-Name</label>
<input
name="name"
value={form.name}
onChange={updateField}
required
/>
</div>

<div>
<label>Breitengrad (lat)</label>
<input
name="latitude"
value={form.latitude}
onChange={updateField}
required
/>
</div>

<div>
<label>L�ngengrad (lng)</label>
<input
name="longitude"
value={form.longitude}
onChange={updateField}
required
/>
</div>

<div>
<label>Link (optional � z.B. Website)</label>
<input
name="ctaUrl"
value={form.ctaUrl}
onChange={updateField}
/>
</div>

<div>
<label>Banner (Bild-Datei)</label>
<input
type="file"
accept="image/*"
onChange={(e) => setBanner(e.target.files[0])}
required
/>
</div>

<button type="submit" style={{ marginTop: 16 }}>
Banner hochladen
</button>
</form>

<p style={{ marginTop: 16 }}>{status}</p>

{adId && (
<button
onClick={goToPayPal}
style={{
marginTop: 12,
padding: "10px 16px",
backgroundColor: "gold",
border: "1px solid #aaa",
cursor: "pointer",
}}
>
Jetzt bezahlen (1 � / Woche)
</button>
)}
</div>
);
}
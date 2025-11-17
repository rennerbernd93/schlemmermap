import dynamic from "next/dynamic";

const MapWithBanners = dynamic(
() => import("../components/MapWithBanners"),
{ ssr: false }
);

export default function Home() {
return (
<div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
<h1>Schlemmermap</h1>
<p>Mittagsmenüs im Umkreis – klick auf einen Stern in der Karte.</p>

<div style={{ margin: "12px 0", display: "flex", gap: 12 }}>
<a href="/add-menu" style={{ textDecoration: "underline" }}>
Speisekarte hinzufügen
</a>
<a href="/buy-ad" style={{ textDecoration: "underline" }}>
Werbung buchen
</a>
</div>

<MapWithBanners />
</div>
);
}
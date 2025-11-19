// pages/admin/dashboard.js
import Link from "next/link";

export default function Dashboard() {
  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Dashboard</h1>

      <ul style={{ marginTop: 20, fontSize: 20 }}>
        <li>
          <Link href="/admin/ads">📢 Werbung verwalten</Link>
        </li>
        <li>
          <Link href="/admin/restaurants">🍽️ Restaurants verwalten</Link>
        </li>
        <li>
          <Link href="/admin/stats">📊 Werbestatistik</Link>
        </li>
      </ul>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function EditRestaurant() {
  const router = useRouter();
  const { id } = router.query;

  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch("/api/admin/get-one?id=" + id)
      .then(r => r.json())
      .then(setRestaurant);
  }, [id]);

  async function save(e) {
    e.preventDefault();

    const form = new FormData(e.target);
    await fetch("/api/admin/update", {
      method: "POST",
      body: form
    });

    router.push("/admin");
  }

  if (!restaurant) return <p>Lade…</p>;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h1>Restaurant bearbeiten</h1>

      <form onSubmit={save}>
        <label>Name</label>
        <input name="name" defaultValue={restaurant.name} style={field} />

        <label>Website</label>
        <input name="website" defaultValue={restaurant.website} style={field} />

        <label>Telefon</label>
        <input name="phone" defaultValue={restaurant.phone} style={field} />

        <label>Speisekarte URL</label>
        <input name="menuUrl" defaultValue={restaurant.menuUrl} style={field} />

        <input type="hidden" name="id" value={restaurant.id} />

        <button type="submit" style={saveBtn}>Speichern</button>
      </form>
    </div>
  );
}

const field = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const saveBtn = {
  width: "100%",
  padding: 12,
  background: "black",
  color: "white",
  borderRadius: 6,
};

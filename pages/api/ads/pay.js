export defexport default function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Keine Ad-ID");

  const paypalMe = process.env.PAYPAL_ME;
  if (!paypalMe) return res.status(500).send("PAYPAL_ME fehlt in .env");

  // 1 € Zahlung
  return res.redirect(`https://www.paypal.me/${paypalMe}/1`);
}

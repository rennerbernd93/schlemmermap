// pages/api/paypal/create-order.js

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { duration } = req.body; // z.B. "7" oder "30"

    if (!duration) {
      return res.status(400).json({ error: "Missing duration" });
    }

    // PREISE FESTLEGEN
    const priceTable = {
      "7": "1.00",     // 1€
      "30": "3.00",    // Beispiel: 3€
    };

    const amount = priceTable[duration];
    if (!amount) return res.status(400).json({ error: "Invalid duration" });

    // PayPal Credentials
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    // GET ACCESS TOKEN
    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // CREATE ORDER
    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: amount,
            },
          },
        ],
      }),
    });

    const order = await orderRes.json();
    return res.status(200).json(order);

  } catch (err) {
    console.error("PayPal create error:", err);
    res.status(500).json({ error: "PayPal create error" });
  }
}

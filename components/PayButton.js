"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

export default function PayButton({ amount }) {
  const [{ isPending }] = usePayPalScriptReducer();

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return <p>PayPal Fehler: Keine CLIENT-ID gesetzt.</p>;
  }

  return (
    <div>
      {isPending && <p>PayPal lädt…</p>}

      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async () => {
          const res = await fetch("/api/paypal/create-order");
          const data = await res.json();
          return data.id;
        }}
        onApprove={async (data) => {
          await fetch("/api/paypal/capture-order?id=" + data.orderID);
          alert("Zahlung erfolgreich!");
        }}
      />
    </div>
  );
}

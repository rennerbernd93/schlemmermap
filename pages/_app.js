import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function App({ Component, pageProps }) {
return (
<PayPalScriptProvider
options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "" }}
>
<Component {...pageProps} />
</PayPalScriptProvider>
);
}
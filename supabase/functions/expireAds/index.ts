import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Edge Function 'expireAds' running...");

serve(async () => {
  const SUPABASE_URL = Deno.env.get("PROJECT_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({
        error: "Missing PROJECT_URL or SERVICE_ROLE_KEY",
      }),
      { status: 500 }
    );
  }

  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const now = new Date().toISOString();

  // Abgelaufene Ads deaktivieren
  const { error } = await client
    .from("Ad")
    .update({ isActive: false })
    .lt("expiresAt", now);

  if (error) {
    console.error("DB error", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Expired ads deactivated",
    }),
    { status: 200 }
  );
});

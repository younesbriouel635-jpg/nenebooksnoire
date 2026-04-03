import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const eventType = body.event_type;

    console.log("PayPal webhook event:", eventType);

    // Only process subscription activated/renewed events
    if (
      eventType !== "BILLING.SUBSCRIPTION.ACTIVATED" &&
      eventType !== "BILLING.SUBSCRIPTION.RENEWED" &&
      eventType !== "BILLING.SUBSCRIPTION.CANCELLED" &&
      eventType !== "BILLING.SUBSCRIPTION.SUSPENDED"
    ) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscriptionId = body.resource?.id;
    const customId = body.resource?.custom_id; // We'll pass user_id as custom_id

    if (!customId) {
      console.error("No custom_id (user_id) in webhook payload");
      return new Response(JSON.stringify({ error: "Missing custom_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isPremium =
      eventType === "BILLING.SUBSCRIPTION.ACTIVATED" ||
      eventType === "BILLING.SUBSCRIPTION.RENEWED";

    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: isPremium,
        subscription_id: isPremium ? subscriptionId : null,
      })
      .eq("user_id", customId);

    if (error) {
      console.error("Failed to update profile:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log(`Updated user ${customId}: is_premium=${isPremium}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

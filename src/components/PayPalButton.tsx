import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalButton = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);

  // Fetch PayPal settings from system_settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", ["PAYPAL_CLIENT_ID", "PAYPAL_PLAN_ID"]);

      let cid: string | null = null;
      let pid: string | null = null;

      if (data) {
        for (const row of data) {
          if (row.key === "PAYPAL_CLIENT_ID" && row.value) cid = row.value;
          if (row.key === "PAYPAL_PLAN_ID" && row.value) pid = row.value;
        }
      }

      setClientId(cid);
      setPlanId(pid);
    };
    fetchSettings();
  }, []);

  // Load PayPal SDK
  useEffect(() => {
    if (!clientId) return;

    if (document.querySelector('script[data-paypal-sdk]')) {
      setSdkReady(true);
      setLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.setAttribute("data-paypal-sdk", "true");
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
      setLoading(false);
    };
    script.onerror = () => {
      setLoading(false);
      toast({ title: "Failed to load PayPal", variant: "destructive" });
    };
    document.body.appendChild(script);
  }, [clientId]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !paypalRef.current || !planId) return;

    paypalRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          shape: "rect",
          color: "black",
          layout: "vertical",
          label: "subscribe",
        },
        createSubscription: (_data: any, actions: any) => {
          return actions.subscription.create({
            plan_id: planId,
            custom_id: user?.id || "",
          });
        },
        onApprove: async (data: any) => {
          if (user) {
            await supabase
              .from("profiles")
              .update({
                is_premium: true,
                subscription_id: data.subscriptionID,
              })
              .eq("user_id", user.id);
          }
          toast({ title: "Welcome to VIP!", description: "Your subscription is now active." });
          navigate("/dashboard");
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
        },
      })
      .render(paypalRef.current);
  }, [sdkReady, user, planId]);

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground font-sans text-center">
        Please{" "}
        <a href="/auth" className="underline underline-offset-4 text-foreground">
          sign in
        </a>{" "}
        to subscribe.
      </p>
    );
  }

  if (!clientId || !planId) {
    return (
      <p className="text-sm text-muted-foreground font-sans text-center">
        Payment system is being configured.
      </p>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={paypalRef} className="w-full" />
    </div>
  );
};

export default PayPalButton;

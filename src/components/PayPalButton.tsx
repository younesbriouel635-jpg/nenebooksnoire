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

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb";
const PAYPAL_PLAN_ID = import.meta.env.VITE_PAYPAL_PLAN_ID || "P-XXXXXXXXXXXXXXXXXXXXX";

const PayPalButton = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (document.querySelector('script[data-paypal-sdk]')) {
      setSdkReady(true);
      setLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
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
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !paypalRef.current) return;

    // Clear previous buttons
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
            plan_id: PAYPAL_PLAN_ID,
            custom_id: user?.id || "",
          });
        },
        onApprove: async (data: any) => {
          console.log("Subscription approved:", data.subscriptionID);

          // Optimistically update profile
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
  }, [sdkReady, user]);

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

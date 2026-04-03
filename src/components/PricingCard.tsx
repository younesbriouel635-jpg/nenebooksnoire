import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import PayPalButton from "@/components/PayPalButton";

const features = [
  "Unlimited access to all classics",
  "New titles added monthly",
  "Read on any device",
  "Offline reading",
  "No advertisements, ever",
  "Cancel anytime",
];

const PricingCard = () => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();

  return (
    <section id="pricing" className="py-24 px-6 flex flex-col items-center">
      <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Membership
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-16 text-center">
        One Plan. Full Access.
      </h2>

      <div className="w-full max-w-md border-2 border-foreground p-10 sm:p-12">
        <div className="text-center mb-8">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-4">
            VIP Membership
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl sm:text-6xl font-serif font-bold">$50</span>
            <span className="text-muted-foreground font-sans text-sm">/month</span>
          </div>
        </div>

        <div className="border-t border-border my-8" />

        <ul className="space-y-4 mb-10">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 font-sans text-sm">
              <Check className="h-4 w-4 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {isPremium ? (
          <div className="text-center">
            <p className="font-serif text-lg font-bold mb-2">You're a VIP Member</p>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-sm tracking-widest uppercase py-6"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : user ? (
          <PayPalButton />
        ) : (
          <Button
            size="lg"
            className="w-full text-sm tracking-widest uppercase py-6"
            onClick={() => navigate("/auth")}
          >
            Sign In to Subscribe
          </Button>
        )}
      </div>
    </section>
  );
};

export default PricingCard;

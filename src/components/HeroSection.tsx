import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center border-b border-border">
      <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-8">
        Est. 2025
      </p>
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tight max-w-4xl mb-6">
        Unlimited Access to the World's Classics
      </h1>
      <p className="text-lg sm:text-xl font-sans text-muted-foreground max-w-xl mb-2">
        for <span className="text-foreground font-semibold">$50/month</span>
      </p>
      <p className="text-sm font-sans text-muted-foreground max-w-md mb-10">
        A curated digital library of timeless literature. No distractions. Just the written word.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="text-sm tracking-widest uppercase px-10 py-6" onClick={() => navigate("/auth")}>
          Start Reading
        </Button>
        <Button variant="outline" size="lg" className="text-sm tracking-widest uppercase px-10 py-6" onClick={() => {
          document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
        }}>
          View Membership
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;

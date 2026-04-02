import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PricingCard from "@/components/PricingCard";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <HeroSection />
    <PricingCard />
    <Footer />
  </div>
);

export default Index;

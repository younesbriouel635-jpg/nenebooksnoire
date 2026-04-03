import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Crown, LogOut } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Dashboard = () => {
  const { user, isPremium, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const [booksRes, profileRes] = await Promise.all([
        supabase.from("books").select("*").limit(6),
        supabase.from("profiles").select("subscription_id").eq("user_id", user.id).single(),
      ]);

      setBooks(booksRes.data || []);
      setSubscriptionId(profileRes.data?.subscription_id || null);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    toast({
      title: "To cancel your subscription",
      description: "Please visit PayPal.com → Settings → Payments → Manage automatic payments to cancel.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">
              Welcome back
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Subscription Status */}
        <div className="border-2 border-border p-8 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-5 w-5 text-primary" />
            <p className="text-xs font-sans tracking-[0.3em] uppercase">
              Membership Status
            </p>
          </div>

          {isPremium ? (
            <div>
              <p className="font-serif text-xl font-bold mb-1">VIP Member</p>
              <p className="text-sm font-sans text-muted-foreground mb-4">
                You have unlimited access to the entire library.
              </p>
              {subscriptionId && (
                <p className="text-xs font-sans text-muted-foreground mb-4">
                  Subscription: {subscriptionId}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs tracking-widest uppercase"
                onClick={handleCancelSubscription}
              >
                Manage Subscription
              </Button>
            </div>
          ) : (
            <div>
              <p className="font-serif text-xl font-bold mb-1">Free Account</p>
              <p className="text-sm font-sans text-muted-foreground mb-4">
                Upgrade to VIP for unlimited access to all classics.
              </p>
              <Button
                size="sm"
                className="text-xs tracking-widest uppercase"
                onClick={() => navigate("/pricing")}
              >
                Upgrade to VIP — $50/mo
              </Button>
            </div>
          )}
        </div>

        {/* Current Reads */}
        <div>
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Current Reads
          </p>
          <h2 className="text-2xl font-serif font-bold mb-8">Your Library</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground font-sans">Loading...</p>
          ) : books.length === 0 ? (
            <div className="border border-border p-12 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="font-serif text-lg mb-2">No books yet</p>
              <p className="text-sm text-muted-foreground font-sans mb-6">
                Start exploring the collection.
              </p>
              {isPremium && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs tracking-widest uppercase"
                  onClick={() => navigate("/library")}
                >
                  Browse Library
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => isPremium && navigate(`/book/${book.id}`)}
                  className={`text-left group ${!isPremium ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isPremium}
                >
                  <div className="aspect-[2/3] bg-secondary border border-border mb-3 overflow-hidden">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-serif text-sm font-semibold leading-tight">{book.title}</p>
                  <p className="text-xs text-muted-foreground font-sans mt-1">{book.author}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

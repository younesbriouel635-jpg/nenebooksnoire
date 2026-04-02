import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export const PremiumGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isPremium, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground font-sans tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isPremium && !isAdmin) return <Navigate to="/pricing" replace />;

  return <>{children}</>;
};

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground font-sans tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

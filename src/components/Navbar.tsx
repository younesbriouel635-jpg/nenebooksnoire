import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <BookOpen className="h-5 w-5" />
        <span className="font-serif text-lg font-bold tracking-tight">NENEbooks</span>
      </div>
      <div className="flex items-center gap-2">
        {!loading && isAdmin && (
          <Button variant="outline" size="sm" className="text-xs tracking-widest uppercase gap-1.5" onClick={() => navigate("/admin")}>
            <Settings className="h-3 w-3" /> Manage Books
          </Button>
        )}
        {!loading && (
          user ? (
            <Button variant="outline" size="sm" className="text-xs tracking-widest uppercase" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="text-xs tracking-widest uppercase" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;

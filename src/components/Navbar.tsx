import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <BookOpen className="h-5 w-5" />
        <span className="font-serif text-lg font-bold tracking-tight">NENEbooks</span>
      </div>
      <Button variant="outline" size="sm" className="text-xs tracking-widest uppercase" onClick={() => navigate("/auth")}>
        Sign In
      </Button>
    </nav>
  );
};

export default Navbar;

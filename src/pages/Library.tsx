import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

const Library = () => {
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from("books").select("*").order("title");
      setBooks(data ?? []);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-4 text-center">
          Your Collection
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-center mb-16">
          The Library
        </h1>

        {loading ? (
          <p className="text-center text-muted-foreground text-sm font-sans">Loading catalogue...</p>
        ) : books.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm font-sans">The shelves are empty — books coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="group text-left"
              >
                <div className="aspect-[2/3] bg-secondary border border-border overflow-hidden mb-3 relative">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-lg text-muted-foreground">{book.title[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-sm font-semibold leading-tight mb-1 group-hover:underline underline-offset-2">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground font-sans">{book.author}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Library;

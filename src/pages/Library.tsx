import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type BookWithCategory = Tables<"books"> & { category?: string | null };

const Library = () => {
  const [books, setBooks] = useState<BookWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from("books").select("*").order("title");
      setBooks((data as BookWithCategory[]) ?? []);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const categories = ["All", ...Array.from(new Set(books.map((b) => b.category).filter(Boolean) as string[]))];
  const filtered = selectedCategory === "All" ? books : books.filter((b) => b.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-4 text-center">
          Your Collection
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-center mb-10">
          The Library
        </h1>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-sans px-4 py-2 border transition-colors tracking-widest uppercase ${
                  selectedCategory === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground text-sm font-sans">Loading catalogue...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm font-sans">No books in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
            {filtered.map((book) => (
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
                <p className="text-xs text-muted-foreground font-sans">
                  {book.author}
                  {book.category && <span> · {book.category}</span>}
                </p>
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

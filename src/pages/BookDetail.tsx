import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Tables<"books"> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      const { data } = await supabase.from("books").select("*").eq("id", id).single();
      setBook(data);
      setLoading(false);
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground font-sans tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="font-serif text-xl">Book not found</p>
        <Button variant="outline" onClick={() => navigate("/library")}>Back to Library</Button>
      </div>
    );
  }

  const handleStartReading = async () => {
    if (!book.file_url) return;
    const { data } = await supabase.storage.from("book-files").createSignedUrl(book.file_url, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/library")}
          className="flex items-center gap-2 text-sm text-muted-foreground font-sans mb-10 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </button>

        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="aspect-[2/3] bg-secondary border border-border overflow-hidden">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-serif text-4xl text-muted-foreground">{book.title[0]}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground mb-3">
              {book.author}
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-6">{book.title}</h1>

            {book.description && (
              <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-8">
                {book.description}
              </p>
            )}

            <div className="border-t border-border pt-8">
              <Button
                size="lg"
                className="text-sm tracking-widest uppercase px-10 py-6"
                onClick={handleStartReading}
                disabled={!book.file_url}
              >
                {book.file_url ? "Start Reading" : "Coming Soon"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookDetail;

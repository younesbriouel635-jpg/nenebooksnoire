import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { translateText, getSignedBookUrl } from "@/lib/reader-utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronLeft, ChevronRight, Languages, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

type Lang = "original" | "ar" | "en" | "fr" | "es";

const LANG_LABELS: Record<Lang, string> = {
  original: "Original",
  ar: "العربية",
  en: "English",
  fr: "Français",
  es: "Español",
};

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [book, setBook] = useState<Tables<"books"> | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageText, setPageText] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [lang, setLang] = useState<Lang>("original");
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showText, setShowText] = useState(false);

  // Load book and PDF
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data: bookData } = await supabase.from("books").select("*").eq("id", id).single();
      if (!bookData) {
        toast({ title: "Book not found", variant: "destructive" });
        navigate("/library");
        return;
      }
      setBook(bookData);

      if (!bookData.file_url) {
        setLoading(false);
        return;
      }

      const signedUrl = await getSignedBookUrl(bookData.file_url);
      if (!signedUrl) {
        toast({ title: "Could not load book file", variant: "destructive" });
        setLoading(false);
        return;
      }

      try {
        const doc = await pdfjsLib.getDocument(signedUrl).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        console.error("PDF load error:", err);
        toast({ title: "Failed to load PDF", variant: "destructive" });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Render page
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Extract text
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(" ");
      setPageText(text);
      setDisplayText(text);
      setLang("original");
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, renderPage]);

  // Translation
  const handleTranslate = async (targetLang: Lang) => {
    if (targetLang === "original") {
      setDisplayText(pageText);
      setLang("original");
      return;
    }
    if (!pageText.trim()) return;

    setTranslating(true);
    setLang(targetLang);
    try {
      const translated = await translateText(pageText, targetLang, book?.id);
      setDisplayText(translated);
      setShowText(true);
    } catch (err: any) {
      toast({ title: "Translation failed", description: err.message, variant: "destructive" });
      setLang("original");
      setDisplayText(pageText);
    } finally {
      setTranslating(false);
    }
  };

  const isRTL = lang === "ar";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!book?.file_url) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="font-serif text-xl">No file available for this book.</p>
        <Button variant="outline" onClick={() => navigate(`/book/${id}`)}>
          Back to Details
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-reader text-reader-foreground flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/book/${id}`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-serif text-sm font-semibold truncate max-w-[200px]">
            {book.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 border border-border disabled:opacity-30 hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-sans tabular-nums min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 border border-border disabled:opacity-30 hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Languages className="h-4 w-4 text-muted-foreground mr-1" />
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => handleTranslate(l)}
              className={`text-xs font-sans px-2 py-1 border transition-colors ${
                lang === l
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowText((s) => !s)}
          className="text-xs font-sans px-3 py-1 border border-border hover:bg-secondary transition-colors"
        >
          {showText ? "Hide Text" : "Show Text"}
        </button>
      </div>

      {/* Reader */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* PDF Canvas */}
        <div className="flex-1 overflow-auto flex justify-center p-4 bg-reader/80">
          <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" />
        </div>

        {/* Text Panel */}
        {showText && (
          <div
            className={`w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border overflow-auto p-6 ${
              isRTL ? "text-right" : "text-left"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-sans tracking-[0.2em] uppercase text-muted-foreground">
                {LANG_LABELS[lang]}
              </p>
              {translating && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <p
              className={`text-sm font-sans leading-relaxed whitespace-pre-wrap ${
                isRTL ? "font-sans" : ""
              }`}
              style={isRTL ? { fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" } : undefined}
            >
              {translating ? "Translating..." : displayText || "No text extracted from this page."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reader;

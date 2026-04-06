import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Upload, Settings, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "History", "Philosophy", "Poetry", "Biography", "Technology", "Other"];

const AdminDashboard = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [books, setBooks] = useState<(Tables<"books"> & { category?: string | null })[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalPlanId, setPaypalPlanId] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    setBooks(data ?? []);
    setLoadingBooks(false);
  };

  const fetchSettings = async () => {
      const { data } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["PAYPAL_CLIENT_ID", "PAYPAL_PLAN_ID"]);
    if (data) {
      for (const row of data) {
        if (row.key === "PAYPAL_CLIENT_ID") setPaypalClientId(row.value);
        if (row.key === "PAYPAL_PLAN_ID") setPaypalPlanId(row.value);
      }
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      for (const { key, value } of [
        { key: "PAYPAL_CLIENT_ID", value: paypalClientId },
        { key: "PAYPAL_PLAN_ID", value: paypalPlanId },
      ]) {
        if (!value.trim()) continue;
        const { error } = await supabase
          .from("system_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
        if (error) throw error;
      }
      toast({ title: "Settings saved successfully." });
      setSettingsOpen(false);
    } catch (error: any) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;
    setUploading(true);

    try {
      let cover_url: string | null = null;
      let file_url: string | null = null;
      const bookId = crypto.randomUUID();

      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `${bookId}.${ext}`;
        const { error } = await supabase.storage.from("book-covers").upload(path, coverFile);
        if (error) throw error;
        const { data } = supabase.storage.from("book-covers").getPublicUrl(path);
        cover_url = data.publicUrl;
      }

      if (bookFile) {
        const ext = bookFile.name.split(".").pop();
        const path = `${bookId}.${ext}`;
        const { error } = await supabase.storage.from("book-files").upload(path, bookFile);
        if (error) throw error;
        file_url = path;
      }

      const { error } = await supabase.from("books").insert({
        id: bookId,
        title,
        author,
        description: description || null,
        cover_url,
        file_url,
        category: category || null,
      });

      if (error) throw error;

      toast({ title: "Book uploaded successfully." });
      setTitle("");
      setAuthor("");
      setDescription("");
      setCategory("");
      setCoverFile(null);
      setBookFile(null);
      fetchBooks();
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Book deleted." });
      fetchBooks();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <BookOpen className="h-5 w-5" />
          <span className="font-serif text-lg font-bold tracking-tight">NENEbooks</span>
          <span className="text-xs text-muted-foreground font-sans ml-2 tracking-widest uppercase">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs tracking-widest uppercase gap-2">
                <Settings className="h-3 w-3" /> Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">System Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase font-sans">PayPal Client ID</Label>
                  <Input
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    placeholder="Enter PayPal Client ID"
                    className="border-foreground/20 rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase font-sans">PayPal Plan ID</Label>
                  <Input
                    value={paypalPlanId}
                    onChange={(e) => setPaypalPlanId(e.target.value)}
                    placeholder="Enter PayPal Plan ID"
                    className="border-foreground/20 rounded-none"
                  />
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full text-sm tracking-widest uppercase"
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="text-xs tracking-widest uppercase gap-2" onClick={signOut}>
            <LogOut className="h-3 w-3" /> Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Upload Form */}
        <h1 className="text-3xl font-serif font-bold mb-2">Upload a Book</h1>
        <p className="text-sm text-muted-foreground font-sans mb-10">Add a new title to the NENEbooks catalogue.</p>

        <form onSubmit={handleUpload} className="space-y-6 max-w-lg mb-20">
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="border-foreground/20 rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Author *</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} required className="border-foreground/20 rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-foreground/20 rounded-none">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="border-foreground/20 rounded-none resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Cover Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="border-foreground/20 rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Book File (PDF / EPUB)</Label>
            <Input type="file" accept=".pdf,.epub" onChange={(e) => setBookFile(e.target.files?.[0] ?? null)} className="border-foreground/20 rounded-none" />
          </div>
          <Button type="submit" size="lg" className="w-full text-sm tracking-widest uppercase py-6 gap-2" disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Book"}
          </Button>
        </form>

        {/* Book List */}
        <h2 className="text-2xl font-serif font-bold mb-2">Catalogue</h2>
        <p className="text-sm text-muted-foreground font-sans mb-8">Manage existing books.</p>

        {loadingBooks ? (
          <p className="text-sm text-muted-foreground font-sans">Loading...</p>
        ) : books.length === 0 ? (
          <p className="text-sm text-muted-foreground font-sans">No books uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className="flex items-center justify-between border border-border p-4">
                <div className="flex items-center gap-4 min-w-0">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt="" className="w-10 h-14 object-cover border border-border flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-14 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-serif text-sm font-semibold truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground font-sans">{book.author} {book.category ? `· ${book.category}` : ""}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 flex-shrink-0" onClick={() => handleDelete(book.id)}>
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

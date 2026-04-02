import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Upload } from "lucide-react";

const AdminDashboard = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

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
      });

      if (error) throw error;

      toast({ title: "Book uploaded successfully." });
      setTitle("");
      setAuthor("");
      setDescription("");
      setCoverFile(null);
      setBookFile(null);
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
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
        <Button variant="outline" size="sm" className="text-xs tracking-widest uppercase gap-2" onClick={signOut}>
          <LogOut className="h-3 w-3" /> Sign Out
        </Button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-16">
        <h1 className="text-3xl font-serif font-bold mb-2">Upload a Book</h1>
        <p className="text-sm text-muted-foreground font-sans mb-10">Add a new title to the NENEbooks catalogue.</p>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="border-foreground/20 rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Author *</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} required className="border-foreground/20 rounded-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="border-foreground/20 rounded-none resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Cover Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="border-foreground/20 rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase font-sans">Book File (PDF / EPUB)</Label>
            <Input
              type="file"
              accept=".pdf,.epub"
              onChange={(e) => setBookFile(e.target.files?.[0] ?? null)}
              className="border-foreground/20 rounded-none"
            />
          </div>
          <Button type="submit" size="lg" className="w-full text-sm tracking-widest uppercase py-6 gap-2" disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Book"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { supabase } from "@/integrations/supabase/client";

const TRANSLATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`;

export async function translateText(
  text: string,
  targetLanguage: string,
  bookId?: string
): Promise<string> {
  // 1. Check cache first
  const { data: cached } = await supabase
    .from("translations_cache")
    .select("translated_text")
    .eq("source_text", text)
    .eq("target_language", targetLanguage)
    .maybeSingle();

  if (cached?.translated_text) {
    return cached.translated_text;
  }

  // 2. Call AI translation
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const resp = await fetch(TRANSLATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, targetLanguage }),
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || "Translation failed");
  }

  const { translatedText } = await resp.json();

  // 3. Cache the result
  await supabase.from("translations_cache").upsert(
    {
      source_text: text,
      target_language: targetLanguage,
      translated_text: translatedText,
      book_id: bookId || null,
    },
    { onConflict: "source_text,target_language" }
  );

  return translatedText;
}

export async function getSignedBookUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("book-files")
    .createSignedUrl(filePath, 3600);
  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }
  return data.signedUrl;
}

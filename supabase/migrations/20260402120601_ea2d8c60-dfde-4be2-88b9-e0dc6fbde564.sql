
CREATE TABLE public.translations_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_text TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (source_text, target_language)
);

ALTER TABLE public.translations_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read translations cache"
  ON public.translations_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert translations cache"
  ON public.translations_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_translations_cache_lookup
  ON public.translations_cache (source_text, target_language);

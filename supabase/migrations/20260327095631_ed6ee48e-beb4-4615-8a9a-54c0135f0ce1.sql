
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('context-pdfs', 'context-pdfs', false, 4718592, ARRAY['application/pdf']);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Nouvelle conversation',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_bundle jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Users can upload context PDFs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'context-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own context PDFs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'context-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own context PDFs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'context-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

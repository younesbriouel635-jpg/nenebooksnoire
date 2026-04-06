
-- Allow all authenticated users to read system_settings (PayPal client ID is publishable)
DROP POLICY IF EXISTS "Admins can read settings" ON public.system_settings;

CREATE POLICY "Authenticated users can read settings"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

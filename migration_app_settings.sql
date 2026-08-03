-- Run this SQL in your Supabase SQL Editor

CREATE TABLE app_settings (
  id serial PRIMARY KEY,
  active_billing_month integer NOT NULL,
  active_billing_year integer NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Initialize the row with the current system month/year as default
INSERT INTO app_settings (id, active_billing_month, active_billing_year)
VALUES (1, EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(YEAR FROM CURRENT_DATE));

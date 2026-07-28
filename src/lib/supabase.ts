import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hnwnffzsvaziqvumsbjf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhud25mZnpzdmF6aXF2dW1zYmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMzMyODUsImV4cCI6MjEwMDgwOTI4NX0.ItD8PVsteQUGu2JhnBMtsv_eZcbVSfgEkVNSR40OYTo";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

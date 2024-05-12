import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cktmurkcivxkxufutobj.supabase.co";
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdG11cmtjaXZ4a3h1ZnV0b2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MjQ2NDEsImV4cCI6MjAzMTAwMDY0MX0.fapqpJHNJLk3lY9DrHTSCqF_Q4JmUjjeerGrKMtKbw8";
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

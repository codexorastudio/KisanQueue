import { createClient } from "@supabase/supabase-js";

function getEnvVar(key: string): string {
  try {
    if (typeof process !== "undefined" && process.env) {
      if (process.env[key]) return process.env[key] as string;
    }
  } catch {
    // ignore
  }
  return "";
}

// Statically accessible for Vite bundle
const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env["VITE_SUPABASE_URL"]) ||
  getEnvVar("VITE_SUPABASE_URL") ||
  "https://mjvtbpquoyxtupxsohow.supabase.co";

const SUPABASE_ANON_KEY =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env["VITE_SUPABASE_ANON_KEY"]) ||
  getEnvVar("VITE_SUPABASE_ANON_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdnRicHF1b3l4dHVweHNvaG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDI0MTUsImV4cCI6MjEwNDYxODQxNX0.a2qE-deRKpMEXIU-JMKuV-KCIJQSYEadw-A0zio4jA0";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

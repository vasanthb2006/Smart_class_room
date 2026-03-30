import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aclmeegzzbljxkzqsqwl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbG1lZWd6emJsanhrenFzcXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDMxMTIsImV4cCI6MjA4OTgxOTExMn0.rxYMtRNU8vB3zHGxpGG8x3gGbUJXVlEBS7NrysTqlaw'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️  Supabase env vars are missing. Using fallback demo project values. For production, copy .env.example to .env.local and configure your own credentials.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      // Optional: disable shared Navigator Lock API if it causes AbortError
      // in this browser/strict-mode environment.
      lock: async (name, acquireTimeout, fn) => {
        return await fn()
      },
    },
  }
)

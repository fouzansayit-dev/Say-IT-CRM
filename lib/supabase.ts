import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const supabaseUrl = rawUrl.trim()
const supabaseAnonKey = rawKey.trim()

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== 'https://your-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== 'https://placeholder-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== 'your-supabase-anon-key' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== 'placeholder-anon-key'
)

if (!isSupabaseConfigured) {
  if (typeof window !== 'undefined') {
    console.warn('Supabase URL or Anon Key is not properly configured. Database operations will use fallback modes.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

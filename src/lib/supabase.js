import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("Initializing Supabase client with URL:", supabaseUrl)

// Check if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use implicit flow for development, PKCE for production
    flowType: isDevelopment ? 'implicit' : 'pkce',
    // Longer storage time for session
    storageKey: 'curatorex-auth-token',
    storage: localStorage
  },
  debug: true
}) 
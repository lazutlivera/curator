import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    
    flowType: isDevelopment ? 'implicit' : 'pkce',
    
    storageKey: 'curatorex-auth-token',
    storage: localStorage
  },
  debug: true
}) 
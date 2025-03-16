import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          flowType: 'popup'
        }
      })
      
      if (error) {
        throw error
      }

      if (data?.url) {
        console.log('Redirect URL:', data.url)
      }
      
      // Handle successful sign in
      if (data?.session) {
        console.log('Session established:', data.session)
      }

    } catch (error) {
      console.error('Authentication error:', error.message)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-lg disabled:opacity-50"
      >
        <img 
          src="https://www.google.com/favicon.ico" 
          alt="Google" 
          className="w-5 h-5"
        />
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  )
} 
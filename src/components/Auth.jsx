import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)
      

      const currentUrl = window.location.href

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth`
        }
      })
      
      if (error) {
        console.error("Auth: Error initiating OAuth flow:", error)
        setDebugInfo({
          error: error.message,
          errorCode: error.code,
          status: error.status,
          details: "Error occurred while initiating the OAuth flow"
        })
        throw error
      }

      if (data?.url) {

        try {
          localStorage.setItem('lastOAuthRedirectUrl', data.url)
        } catch (e) {
          console.warn('Could not store redirect URL in localStorage:', e)
        }

        window.location.href = data.url
      } else {
        const errorMsg = "No redirect URL returned from authentication service"
        console.error("Auth:", errorMsg)
        setError(errorMsg)
        setDebugInfo({
          error: errorMsg,
          data: JSON.stringify(data),
          details: "The OAuth provider did not return a URL to redirect to"
        })
        setLoading(false)
      }
      
    } catch (error) {
      console.error("Auth: Authentication error:", error)
      setError(error.message || "Failed to sign in with Google")
      setLoading(false)
    }
  }

  const handleTestUserSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)
      
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@curatorex.com',
        password: 'test123'
      })
      
      if (error) {
        console.error("Auth: Test user sign-in error:", error)
        setDebugInfo({
          error: error.message,
          errorCode: error.code,
          status: error.status,
          details: "Error signing in with test user"
        })
        throw error
      }
      
      
    } catch (error) {
      console.error("Auth: Test user authentication error:", error)
      setError(error.message || "Failed to sign in as test user")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-full hover:bg-emerald-600 transition-colors duration-200 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>

      <button
        onClick={handleTestUserSignIn}
        disabled={loading}
        className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-200 shadow-lg"
      >
        {loading ? 'Signing in...' : 'Test User Login'}
      </button>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative mt-2 max-w-xs">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-gray-800/70 border border-emerald-900/30 text-emerald-200/80 px-4 py-3 rounded relative mt-2 max-w-xs text-xs">
          <strong className="font-bold">Debug Info: </strong>
          <pre className="mt-2 overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-4 max-w-xs text-center">
        <p>If you encounter issues signing in, please ensure:</p>
        <ul className="list-disc pl-5 mt-1 text-left">
          <li>Your Google account is properly set up</li>
          <li>You allow pop-ups from this site</li>
          <li>You accept the necessary permissions</li>
        </ul>
      </div>
    </div>
  )
} 
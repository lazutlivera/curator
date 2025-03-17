import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function OAuthHandler() {
  const [status, setStatus] = useState('Processing your sign-in...')
  const [error, setError] = useState(null)
  const [errorLog, setErrorLog] = useState([])
  const [showErrorLog, setShowErrorLog] = useState(false)

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        console.log("OAuthHandler: Starting authentication process")
        
        
        const fullUrl = window.location.href
        console.log("OAuthHandler: Current URL:", fullUrl)
        addToErrorLog("Current URL: " + fullUrl)
        
        
        if (window.location.hash && window.location.hash.includes('access_token=')) {
          console.log("OAuthHandler: Found access_token in hash, using implicit flow")
          addToErrorLog("Found access_token in hash, using implicit flow")
          
          
          const { data, error } = await supabase.auth.setSession({
            access_token: getParameterFromHash('access_token'),
            refresh_token: getParameterFromHash('refresh_token')
          })
          
          if (error) {
            addToErrorLog("Implicit flow error: " + error.message)
            throw error
          }
          
          console.log("OAuthHandler: Implicit flow successful", data?.user?.user_metadata)
          addToErrorLog("Implicit flow successful")
          setStatus('Sign-in successful!')
          setTimeout(() => { window.location.href = '/' }, 800)
          return
        }
        
        
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        
        if (code) {
          console.log("OAuthHandler: Found code in URL, using authorization code flow")
          addToErrorLog("Found code in URL, using authorization code flow")
          
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            addToErrorLog("Authorization code flow error: " + error.message)
            throw error
          }
          
          console.log("OAuthHandler: Authorization code flow successful", data?.user?.user_metadata)
          addToErrorLog("Authorization code flow successful")
          setStatus('Sign-in successful!')
          setTimeout(() => { window.location.href = '/' }, 800)
        } else {
          console.error("OAuthHandler: No code or access_token found")
          const errorMsg = 'No authentication code or token was found in the URL. Please try signing in again.'
          addToErrorLog(errorMsg)
          setStatus('Sign-in failed. No authentication code found.')
          setError(errorMsg)
          setTimeout(() => { window.location.href = '/' }, 3000)
        }
      } catch (error) {
        console.error('OAuthHandler: Authentication error:', error)
        addToErrorLog("Authentication error: " + (error.message || 'Unknown error'))
        setStatus('Sign-in failed. Please try again.')
        setError(error.message || 'An unknown error occurred during authentication')
        setTimeout(() => { window.location.href = '/' }, 3000)
      }
    }
    
    
    const getParameterFromHash = (paramName) => {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      return params.get(paramName)
    }
    
    
    const addToErrorLog = (message) => {
      const timestamp = new Date().toISOString()
      setErrorLog(prev => [...prev, `[${timestamp}] ${message}`])
    }
    
    handleAuthRedirect()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800/50 p-8 rounded-xl border border-emerald-900/30 shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-emerald-300 mb-6">Authentication</h2>
        <p className="text-emerald-100/90 mb-6 text-lg">{status}</p>
        
        {error ? (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}
        
        <p className="text-emerald-100/70 text-sm mb-4">
          {error ? 'Redirecting you back to the sign-in page...' : 'Please wait while we complete your sign-in...'}
        </p>
        
        <button 
          onClick={() => setShowErrorLog(!showErrorLog)} 
          className="text-xs text-emerald-400 hover:text-emerald-300 underline"
        >
          {showErrorLog ? 'Hide Debug Log' : 'Show Debug Log'}
        </button>
        
        {showErrorLog && errorLog.length > 0 && (
          <div className="mt-4 bg-gray-900/50 p-3 rounded text-left text-xs text-emerald-200/70 max-h-60 overflow-auto">
            <pre>
              {errorLog.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 
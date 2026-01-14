// app/auth/callback/page.tsx (CLIENT COMPONENT)
"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { Loader2 } from 'lucide-react'

interface GoogleTokens {
  provider_token: string;
  provider_refresh_token: string | null;
  expires_in: number | null;
  scope?: string;
}

export default function CallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const processedRef = useRef(false)

  useEffect(() => {
    // Prevent double processing
    if (processedRef.current) return
    processedRef.current = true

    const handleCallback = async () => {
      try {
        // For implicit flow, tokens come in URL hash fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')
        const provider_token = hashParams.get('provider_token')
        const provider_refresh_token = hashParams.get('provider_refresh_token')
        const expires_in = hashParams.get('expires_in')
        const error = hashParams.get('error')
        const error_description = hashParams.get('error_description')

        // Also check query params for errors
        const searchParams = new URLSearchParams(window.location.search)
        const queryError = searchParams.get('error')
        const queryErrorDescription = searchParams.get('error_description')

        if (error || queryError) {
          console.error('OAuth error:', error || queryError, error_description || queryErrorDescription)
          setStatus('error')
          setMessage(`Authentication failed: ${error_description || queryErrorDescription || error || queryError}`)
          setTimeout(() => router.push('/authentication'), 3000)
          return
        }

        console.log('Processing OAuth callback...')
        console.log('Full URL hash:', window.location.hash)
        console.log('Hash params:', Object.fromEntries(hashParams.entries()))
        console.log('Hash contains access_token:', !!access_token)
        console.log('Hash contains provider_token:', !!provider_token)
        console.log('Hash contains provider_refresh_token:', !!provider_refresh_token)

        // If we have tokens in the hash, set the session
        if (access_token) {
          console.log('Setting session with tokens from hash...')
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || ''
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setStatus('error')
            setMessage('Failed to establish session')
            setTimeout(() => router.push('/authentication'), 3000)
            return
          }

          console.log('Session established successfully')
          
          // Store Google tokens if available
          if (provider_token && data.user) {
            console.log('User ID:', data.user.id)
            console.log('Provider token available:', !!provider_token)
            console.log('Provider refresh token available:', !!provider_refresh_token)
            
            try {
              await storeGoogleTokens(data.user.id, {
                provider_token,
                provider_refresh_token: provider_refresh_token || null,
                expires_in: expires_in ? parseInt(expires_in) : null,
                scope: '' // Will use default scopes
              })
              console.log('Google tokens stored successfully')
            } catch (tokenError) {
              console.error('Error storing Google tokens:', tokenError)
            }
          } else {
            console.warn('No provider_token in hash - Google tokens will not be stored')
            console.warn('This usually means Supabase is not configured to return provider tokens')
          }

          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Clean up URL and redirect
          window.history.replaceState(null, '', window.location.pathname)
          setTimeout(() => router.push('/chat'), 1500)
          return
        }

        // No tokens in hash, try to get existing session
        console.log('No tokens in hash, checking for existing session...')
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession()

        if (getSessionError) {
          console.error('Session error:', getSessionError)
          setStatus('error')
          setMessage('Failed to get session')
          setTimeout(() => router.push('/authentication'), 3000)
          return
        }

        if (session) {
          console.log('Existing session found')
          setStatus('success')
          setMessage('Already authenticated! Redirecting...')
          setTimeout(() => router.push('/chat'), 1500)
          return
        }

        // No session and no tokens
        console.error('No tokens found and no existing session')
        setStatus('error')
        setMessage('No authentication data received')
        setTimeout(() => router.push('/authentication'), 3000)

      } catch (error) {
        console.error('Callback error:', error)
        setStatus('error')
        setMessage('Unexpected error occurred')
        setTimeout(() => router.push('/authentication'), 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Completing authentication...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we set up your account.
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Success!
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Authentication Failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <p className="mt-2 text-xs text-gray-500">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to store Google tokens
async function storeGoogleTokens(userId: string, tokens: GoogleTokens) {
  if (!tokens.provider_token) return;

  // Calculate expiry date as ISO timestamp (TIMESTAMPTZ in PostgreSQL)
  const expiryDate = tokens.expires_in 
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : new Date(Date.now() + 3600 * 1000).toISOString(); // Default 1 hour

  // Define comprehensive Google Meet scopes
  const meetScopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/meetings.space.created',
    'https://www.googleapis.com/auth/meetings.space.readonly',
    'openid',
    'profile',
    'email'
  ].join(' ');

  const tokenData = {
    user_id: userId,
    access_token: tokens.provider_token,
    refresh_token: tokens.provider_refresh_token || null,
    expiry_date: expiryDate, // ISO timestamp string for TIMESTAMPTZ
    token_type: 'Bearer',
    scope: tokens.scope || meetScopes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log('Attempting to store tokens for user:', userId);
  console.log('Token data:', { ...tokenData, access_token: '[REDACTED]', refresh_token: tokenData.refresh_token ? '[REDACTED]' : null });

  try {
    // Use upsert for simpler logic - insert or update based on user_id
    const { data, error } = await supabase
      .from('user_google_tokens')
      .upsert(tokenData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Supabase upsert error:', error.message, error.code, error.details, error.hint);
      throw error;
    }
    
    console.log('Google tokens stored/updated successfully:', data);
    console.log('Granted scopes:', tokens.scope);
  } catch (error: any) {
    console.error('Error storing Google tokens:', error?.message || error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
}
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // ✅ Exchange the ?code= param for a real session first
    supabase.auth.exchangeCodeForSession(window.location.search)
      .then(({ error }) => {
        if (error) {
          console.error('Auth error: ', error)
          toast.error(error.message)
          navigate('/login')
        } else {
          toast.success('Signed in!')
          navigate('/dashboard')
        }
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Completing sign in...</p>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success('Signed in!')
        subscription.unsubscribe()
        navigate('/dashboard', { replace: true })
      }
      // } else if (event === 'SIGNED_OUT' || !session) {
      //   toast.error('Authentication failed')
      //   subscription.unsubscribe()
      //   navigate('/login')
      // }
    })

    // Fallback timeout in case event never fires
    const timeout = setTimeout(() => {
      toast.error('Authentication timed out')
      navigate('/login', { replace: true })
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
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
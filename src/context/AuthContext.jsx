import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still loading
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

const fetchProfile = async (user) => {
  setProfileLoading(true)
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        name: user.user_metadata?.full_name || user.email
      },
      { onConflict: "id" }
    )
    .select()
    .single()

  if (!error) setProfile(data)
  setProfileLoading(false)
}
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } },
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      setProfile,
      profileLoading,
      loading: session === undefined,
      signUp, signIn, signInWithGoogle, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user) => {
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name: user.user_metadata?.full_name || user.email,
        },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (!error) setProfile(data);
    setProfileLoading(false);
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) {
    supabase.auth.exchangeCodeForSession(code).then(() => {
      // Clean the URL after exchange
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  }

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        await fetchProfile(data.session.user);
      }

      setLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });
    console.log("SESSION:", session);
    console.log("USER:", session?.user);

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, },
    });
    if (error) throw error;
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        setProfile,
        profileLoading,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

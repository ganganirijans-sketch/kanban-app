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
    try {
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
    } catch (e) {
      console.error("fetchProfile error:", e);
    } finally {
      setProfileLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session);
        setLoading(false);
        if (data.session?.user) fetchProfile(data.session.user);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    const {data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

    // Clear local state
    setSession(null);
    setProfile(null);

    window.location.href = "/login";
  };

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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if(!code) {
      toast.error("No auth code found");
      navigate("/login", { replace: true });
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error) {
        console.log("Exchange error: ", error)
        setError(error.message)
        toast.error("Auth failed");
        navigate("/login", { replace: true });
        
      } else if (data.session){
        toast.error("Signed In");
        navigate("/dashboard", { replace: true });
      }

    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

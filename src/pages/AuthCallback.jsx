import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSession = async () => {
      try {
        const requestUrl = new URL(window.location.href);
        const code = requestUrl.searchParams.get("code");
        if(code){
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          console.log({data, error})
        }
        const { data, error } = await supabase.auth.getSession();
        console.log({data, error})
        if (error) {
          console.error(error);
          toast.error("Authentication failed");
          navigate("/login", { replace: true });
          return;
        }

        if (data.session) {
          toast.success("Signed in!");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 100);
        } else {
          toast.error("No session found");
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error(err);
        navigate("/login", { replace: true });
      }
    };

    handleSession();
  }, []);

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

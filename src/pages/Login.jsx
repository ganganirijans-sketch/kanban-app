import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { RiEyeCloseFill } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa";

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [key, setKey] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err.message);
      setGLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08122e] via-[#031256] to-black flex flex-col ">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl px-8 py-6 bg-white/5 backdrop-blur-lg border border-white/5
shadow-xl shadow-indigo-900/20">
          <h1 className="text-2xl font-bold text-gray-300 mb-2">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">
            Welcome back! Enter your credentials to continue.
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full flex items-center justify-center gap-3 text-gray-300 py-2.5 px-4 bg-white/5 border border-white/10 focus:border-indigo-400 rounded-xl text-sm font-medium hover:bg-white/10 hover:scale-105 transition-colors disabled:opacity-60 mb-5"
          >
            {gLoading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              /* Google SVG icon */
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.4 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.4-4z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.4 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.3C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.3l-6.6 5.1C9.4 39.4 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.3C41 35.6 44 30.2 44 24c0-1.3-.2-2.7-.4-4z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-1.5 border-b-2 text-gray-300 outline-none rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20text-gray-400 text-sm focus:border-transparent focus:scale-[0.98]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mt-5 block text-sm font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3.5 py-1.5 border-b-2 text-gray-300 outline-none rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20text-gray-400 text-sm focus:border-transparent focus:scale-[0.98]"
                />

                <button
                  className="absolute right-3 top-2.5 text-gray-500"
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? <FaRegEye /> : <RiEyeCloseFill />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 font-semibold rounded-xl text-sm  disabled:opacity-60 text-gray-800 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-700 font-semibold hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
      </main>
    </div>
  );
}

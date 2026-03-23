import { useState, useEffect } from "react";
import { Link, useNavigate, useRouteLoaderData } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import toast from "react-hot-toast";
import { IoIosNotifications } from "react-icons/io";
import { supabase } from "../lib/supabase";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function Navbar() {
  const { user, profile, signOut, setProfile, profileLoading } = useAuth();
  const { notifications, unreadCount, markAsRead, reload } = useNotifications();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  const handleNotifOpen = async () => {
    setNotifOpen(true);

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .select();

    console.log(data);
    console.log(error);

    reload(); // ✅ IMPORTANT
  };

  const initialSource =
    profile?.name || user?.user_metadata.full_name || user?.email;
  const initials = initialSource
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
    .toUpperCase();

  const handleAvatarUpload = async (file) => {
    if (!file || !user) return;

    const fileName = `${user.id}/${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      console.log(uploadError);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    // console.log(data.publicUrl);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.log(updateError);
      return;
    }

    setProfile((prev) => ({
      ...prev,
      avatar_url: data.publicUrl,
    }));
  };
  const name = profile?.name
    ? profile.name.charAt(0).toUpperCase() + profile.name.slice(1)
    : "";

  return (
    <nav className="backdrop-blur-md bg-white/5 border-b border-white/10  border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-white font-bold text-4xl">logo</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Notification button */}
          <div className="relative">
            <button
              onClick={handleNotifOpen}
              className="relative p-2 transition text-yellow-400 hover:text-yellow-600 mr-3"
            >
              <IoIosNotifications size={32} />

              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/65 rounded-2xl backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 z-20 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <h3 className="text-white/90 font-semibold text-sm">
                      Recent Activity
                    </h3>
                    <span className="text-xs text-gray-300">
                      {notifications.length} items
                    </span>
                  </div>

                  {/* List */}
                  <div className="max-h-[180px] overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <p className="text-sm text-gray-300">
                          No recent activity
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`group px-4 py-3 border-b border-white/10 last:border-0 cursor-pointer transition-all ${
                            !n.is_read ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {!n.is_read && (
                              <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 " />
                            )}
                            <div className="flex-1 min-w-0 ">
                              <p
                                className={`text-sm truncate ${
                                  !n.is_read
                                    ? "text-white font-medium"
                                    : "text-gray-200"
                                }`}
                              >
                                {n.message.charAt(0).toUpperCase() +
                                  n.message.slice(1)}
                              </p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {timeAgo(n.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative ml-1 flex items-center gap-2">
            <div className="relative group h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              {/* Avatar / Initials */}
              {profileLoading ? (
                <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
              ) : profile?.avatar_url && profile.avatar_url.trim() !== "" && !imgError ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-12 h-12 object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-12 h-12 bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                  {initials}
                </div>
              )}

              {/* Hidden input */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white transition pointer-events-none">
                Edit
              </div>
            </div>

            <button
              onClick={() => {
                setMenuOpen((p) => !p);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="lg:text-xl md:test-lg font-medium text-gray-200 hidden sm:block max-w-[120px] truncate">
                {name}
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 backdrop-blur-md bg-indigo-900 opacity-9 border border-gray-200  rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-white truncate">
                      {name}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-white  transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

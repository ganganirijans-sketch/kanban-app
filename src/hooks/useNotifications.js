import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select(`id, message, task_id, tasks(title), created_at, is_read`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.log(error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
  };
  useEffect(() => {
    if (!user) return;
    loadNotifications();

    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
            if(payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE'){
                loadNotifications();
              }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (id) => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("id", id);

      if (error) {
        console.log(error);
        return;
      }

      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));

    setUnreadCount((prev) => Math.max(prev - 1,0));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    reload: loadNotifications,
  };
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { IoShareSharp } from "react-icons/io5";
import { TiTick } from "react-icons/ti";
import { FaRegCalendarAlt } from "react-icons/fa";

const PRIORITY_STYLES = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function SharedBoard() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Fetch project — works because of the public RLS policy
      const { data: proj, error: projErr } = await supabase
        .from("projects")
        .select("id, name, description, color")
        .eq("id", id)
        .single();

      if (projErr || !proj) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch ONLY completed tasks
      const { data: completedTasks } = await supabase
        .from("tasks")
        .select(
          `id, title, description, priority, due_date, updated_at, task_tags(tag_id, tags(id, name, color))`,
        )
        .eq("project_id", id)
        .eq("status", "completed")
        .order("updated_at", { ascending: false });

      setProject(proj);

      const formattedTasks = (completedTasks || []).map((task) => ({
        ...task,
        tags: task.task_tags?.map((tag) => tag.tags) || [],
      }));

      setTasks(formattedTasks);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#08122e] via-[#031256] to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading shared board...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#08122e] via-[#031256] to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-white/70 mb-2">
            Project not found
          </h1>
          <p className="text-white/50 mb-6">
            This link may be invalid or the project was deleted.
          </p>
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to SignUp
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3b4a75] via-[#031256] to-black">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/5 border border-white/10 border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between text-white text-2xl font-bold">
          logo
          {/* Shared badge */}
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-700 text-indigo-200 border border-indigo-200 rounded-full">
            Shared View
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Project info */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/90 font-bold text-2xl flex-shrink-0 shadow-lg shadow-gray-700"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white/90">
              {project.name.charAt(0).toUpperCase() + project.name.slice(1)}
            </h1>
            {project.description && (
              <p className="text-gray-400 text-sm mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-8 p-4 backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${tasks.length > 0 ? "bg-green-400" : "bg-gray-400"} `}
            />
            <span className="text-sm font-semibold text-gray-300">
              {tasks.length} Completed Tasks
            </span>
          </div>
          <span className="text-white/40">|</span>
          <span className="text-xs text-gray-400">
            This is a read-only shared view. Only completed tasks are shown.
          </span>
        </div>

        {/* Completed tasks grid */}
        {tasks.length === 0 ? (
          <div className="bg-white/5 border-2 border-white/10 dackdrop-blur-md rounded-2xl flex flex-col items-center justify-center py-12">
            <p className="text-6xl mb-4 bg-green-500/20 text-green-300 rounded-2xl">
              <TiTick />
            </p>
            <h3 className="font-semibold text-white/90 text-lg mb-1">
              No completed tasks yet
            </h3>
            <p className="text-gray-400 text-sm">
              Tasks marked as completed will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl border-gray-600 shadow-md shadow-black/20 p-5 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition"
              >
                {/* Green checkmark header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-green-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}
                  >
                    {task.priority?.charAt(0).toUpperCase() +
                      task.priority?.slice(1)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-200 mb-2 leading-snug">
                  {task.title.charAt(0).toUpperCase() + task.title.slice(1)}
                </h3>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {task.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[11px] px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${tag.color}33`,
                        border: `1px solid ${tag.color}55`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                {task.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-3">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-green-300 bg-green-500/10 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                  {task.due_date && (
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <span>
                        <FaRegCalendarAlt />
                      </span>
                      {new Date(task.due_date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-gray-400 text-sm mb-3">
            Want to create your own Kanban board?
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:bg-indigo-800 hover:scale-[1.02] activate:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-colors sticky bottom-0"
          >
            Get started free →
          </Link>
        </div>
      </main>
    </div>
  );
}

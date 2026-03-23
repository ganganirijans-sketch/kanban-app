import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../hooks/useProjects";
import Navbar from "../components/Navbar";
import ProjectModal from "../components/ProjectModal";
import toast from "react-hot-toast";
import { MdPendingActions } from "react-icons/md";
import { BiTask } from "react-icons/bi";
import { FaCalendar, FaFolderPlus } from "react-icons/fa";
import { RiProgress5Line } from "react-icons/ri";
import { ImCross } from "react-icons/im";
import { FiArrowRight } from "react-icons/fi";
import { VscFolderOpened } from "react-icons/vsc";
import { RiShareBoxLine } from "react-icons/ri";

// A single stat card
function StatCard({ icon, label, value, textColor }) {
  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4 leading-relaxed transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
        <div
          className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/10 text-white/80"
        >
          {icon}
        </div>
      <div>
        <p className={`text-2xl font-semibold ${textColor}`}>{value ?? 0}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// A single project card
function ProjectCard({ project, onClick, onDelete, onShare }) {
  const total = project.total_tasks || 0;
  const done = project.completed_tasks || 0;

  return (
    <div
      onClick={onClick}
      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:scale-105 transition-all group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/95 font-bold text-lg leading-relaxed"
          style={{ backgroundColor: project.color }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-white hover:text-red-500 transition-all leading-relaxed"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(project.id);
            }}
            className="flex items-center opacity-0 group-hover:opacity-100 text-white hover:text-blue-400 rounded-lg transition-all"
            title="copy share link"
          >
            <RiShareBoxLine size={15} />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-white mb-1 truncate leading-relaxed">
        {project.name.charAt(0).toUpperCase() + project.name.slice(1)}
      </h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
        {project.description || "No description"}
      </p>

      {/* Task counts */}
      <div className="grid grid-cols-3 divide-x divide-white border-t border-gray-100 pt-3 -mx-1">
        <div className="text-center">
          <p className="font-bold text-gray-200">{total}</p>
          <p className="text-xs text-gray-400 leading-relaxed">Total</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-green-400">{done}</p>
          <p className="text-xs text-gray-400 leading-relaxed">Done</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-red-400">{project.pending_tasks || 0}</p>
          <p className="text-xs text-gray-400 leading-relaxed">Pending</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { projects, recentProjects, stats, loading, createProject, deleteProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const onShare = (id) => {
    navigate(`/share/${id}`);
  };

  const handleCreate = async (data) => {
    try {
      await createProject(data);
      setShowModal(false);
      toast.success("Project created!");
    } catch (err) {
      toast.error(err.message || "Failed to create");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await deleteProject(id);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.name
    ? profile.name[0].toUpperCase() + profile.name.slice(1)
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3b4a75] via-[#031256] to-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 via-indigo-500 to-violet-500 bg-clip-text text-transparent leading-relaxed">
              {greeting}, {firstName}
            </h1>
            <p className="text-white/75 text-sm mt-1 leading-relaxed">
              Here's an overview of your workspace
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-fit flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Project
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<VscFolderOpened size={18} />}
            label="Projects"
            value={stats.total_projects}
            textColor="text-indigo-400"
          />

          <StatCard
            icon={<BiTask size={20} />}
            label="Total Tasks"
            value={stats.total_tasks}
            textColor="text-indigo-400"
          />

          <StatCard
            icon={<FaCalendar />}
            label="Completed"
            value={stats.completed_tasks}
            textColor = {stats.completed_tasks > 0 ? "text-green-300" : "text-indigo-400"}
          />

          <StatCard
            icon={<RiProgress5Line size={20} />}
            label="In Progress"
            value={stats.in_progress_tasks}
            textColor="text-indigo-400"
          />

          <StatCard
            icon={<MdPendingActions size={21} />}
            label="Pending"
            value={stats.pending_tasks}
            textColor ={stats.pending_tasks > 0 ? "text-red-300" : "text-indigo-400"}
          />
        </div>

        <hr />

        {/* Recent project */}
        <div className="p-5">
          <h2 className="text-3xl font-bold text-white/85 mb-1">Recent</h2>

          <p className="text-sm text-white/75 mb-4 leading-relaxed">
            Your recently updated projects
          </p>

          <div className=" late-50 space-y-3 mr-3">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/project/${p.id}`)}
                className="group flex items-center justify-between p-3  rounded-md hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-white/5 border border-white/10  text-gray-400 text-sm focus:border-transparent"
              >
                {/* Left side */}
                <div>
                  <p className="font-medium text-white leading-relaxed">
                    {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                  </p>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Last updated {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Right arrow */}
                <button className="text-gray-400 transition">
                  <FiArrowRight size={22} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr />

        {/* Projects section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 mt-8">
            <h2 className="text-3xl font-bold text-white">
              Projects
              <span className="ml-2 text-base font-medium text-gray-400">
                ({projects.length})
              </span>
            </h2>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="pl-9 pr-4 py-2 bg-white/5 outline-none text-white border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-transparent w-56 leading-relaxed"
              />
            </div>
          </div>

          {loading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br rounded-2xl border border-gray-200 p-5 h-52 animate-pulse"
                >
                  <div className="h-1 bg-gray-400 rounded mb-4 -mt-5 -mx-5" />
                  <div className="w-10 h-10 bg-gray-400 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-400 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-400 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="bg-white/5 border-2 border-white/10 rounded-2xl border-dashed flex flex-col items-center justify-center py-20">
              <div className="mb-3">
                {search ? (
                  <ImCross size={40} className="text-red-400/80 "/>
                ) : (
                  <FaFolderPlus className="text-yellow-400/80" size={50} />
                )}
              </div>
              <h3 className="font-semibold text-white/90 text-lg mb-1">
                {search ? "No matching projects" : "No projects yet"}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {search
                  ? "Try a different search term"
                  : "Create your first project to get started"}
              </p>
              {!search && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 text-white font-medium rounded-xl text-sm bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition shadow-lg shadow-indigo-500/20"
                >
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => navigate(`/project/${p.id}`)}
                  onDelete={handleDelete}
                  onShare={onShare}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}

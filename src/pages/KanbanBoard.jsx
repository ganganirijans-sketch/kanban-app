import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "../lib/supabase";
import { useTasks } from "../hooks/useTasks";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import toast from "react-hot-toast";
import { GoDotFill } from "react-icons/go";
import { FaRegCalendarAlt } from "react-icons/fa";

// Column definition
const COLUMNS = [
  {
    id: "pending",
    label: "Pending",
    headerBg: "bg-yellow-500/30",
    headerText: "text-yellow-300",
    dotColor: "bg-yellow-400",
    badgeBg: "bg-yellow-500/10",
    badgeText: "text-yellow-300",
  },
  {
    id: "in_progress",
    label: "In Progress",
    headerBg: "bg-indigo-500/30",
    headerText: "text-indigo-300",
    dotColor: "bg-indigo-400",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-300",
  },
  {
    id: "completed",
    label: "Completed",
    headerBg: "bg-green-500/20",
    headerText: "text-green-300",
    dotColor: "bg-green-400",
    badgeBg: "bg-green-500/10",
    badgeText: "text-green-300",
  },
];

const PRIORITY_STYLES = {
  low: "bg-green-500/20 text-green-300 backddrop-blur-sm",
  medium: "bg-yellow-500/20 text-yellow-300 backddrop-blur-sm",
  high: "bg-red-500/20 text-red-300 backddrop-blur-sm",
};

// ── Single task card (sortable) ──────────────────────────────
function TaskCard({ task, onEdit, onDelete, onTagClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "completed";

  const [showAll, setShowAll] = useState(false);

  const visibleTag = showAll ? task.tags : task.tags.slice(0, 2);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : transition,
      }}
      className={isDragging ? "opacity-40 scale-[0.98]" : ""}
    >
      <div
        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3.5 cursor-grab active:cursor-grabbing shadow-md shadow-black/20 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 group select-none"
        {...attributes}
        {...listeners}
      >
        {/* Title + action buttons */}
        <div className="flex items-start gap-2 mb-2">
          <p className="flex-1 text-sm font-medium text-white/90 leading-snug">
            {task.title.charAt(0).toUpperCase() + task.title.slice(1)}
          </p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 rounded text-gray-400 hover:text-indigo-400 hover:bg-white/10 transition"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-white/10 transition"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-400 mb-2.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
        {/* Tags */}
        <div className="flex gap-1 flex-wrap mb-1.5">
          {visibleTag.map((tag) => (
            <span
              key={tag.id}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag.name);
              }}
              className="text-[11px] px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${tag.color}33`,
                border: `0.5px solid ${tag.color}55`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}

          {!showAll && task.tags?.length > 2 && (
            <span
              className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-gray-300 cursor-pointer hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
            >
              +{task.tags.length - 2}
            </span>
          )}
        </div>
        {/* Priority + Due date */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}
          >
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
          </span>
          {task.due_date && (
            <span
              className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? "text-red-400" : "text-gray-400"}`}
            >
              <span>{isOverdue ? <GoDotFill /> : <FaRegCalendarAlt />}</span>
              {new Date(task.due_date + "T00:00:00").toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Drag overlay (floating card) ───────────────────────
function TaskOverlay({ task }) {
  if (!task) return null;
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3.5 shadow-xl shadow-black/30 rotate-2 w-64 cursor-grabbing">
      <p className="text-sm font-semibold text-gray-300">{task.title}</p>
      <span
        className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}
      >
        {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
      </span>
    </div>
  );
}

// ── Column ───
function Column({ col, tasks, onAdd, onEdit, onDelete, onTagClick }) {
  const { isOver, setNodeRef } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl flex-1 min-w-[280px] max-w-[720px] transition-all ${
        isOver
          ? "bg-white/10 border border-indigo-400/10 ring-1 ring-indigo-400/30"
          : "bg-white/5 border border-white/10 shadow-black/20 shadow-md"
      }`}
    >
      {/* Column header */}
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border-b border-white/10 ${col.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
          <span className={`font-bold text-sm ${col.headerText}`}>
            {col.label}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAdd(col.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 transition"
        >
          +
        </button>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onTagClick={onTagClick}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-10 gap-2 opacity-40">
            <p className="text-sm font-bold text-gray-300">No tasks yet</p>
            <p className="text-xs text-gray-400">
              Drag tasks here or click + to add
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─
export default function KanbanBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projLoading, setProjLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [modal, setModal] = useState({ open: false, status: null, task: null });
  const [activeTag, setActiveTag] = useState(null);

  const {
    tasks,
    loading,
    reload,
    createTask,
    updateTask,
    deleteTask,
    reorderTask,
    colTasks,
  } = useTasks(id);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Load project details
  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate("/dashboard");
          return;
        }
        setProject(data);
        setProjLoading(false);
      });
  }, [id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const findStatus = (taskId) => tasks.find((t) => t.id === taskId)?.status;

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const srcStatus = findStatus(active.id);
    const destStatus =
      COLUMNS.find((c) => c.id === over.id)?.id ?? findStatus(over.id);
    if (!destStatus || srcStatus === destStatus) return;
    const destIdx =
      over.id === destStatus
        ? colTasks(destStatus).length
        : colTasks(destStatus).findIndex((t) => t.id === over.id);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const srcStatus = findStatus(active.id);
    const destStatus =
      COLUMNS.find((c) => c.id === over.id)?.id ??
      findStatus(over.id) ??
      srcStatus;
    const destIdx =
      over.id === destStatus
        ? colTasks(destStatus).length
        : colTasks(destStatus).findIndex((t) => t.id === over.id);
    reorderTask(active.id, destStatus, Math.max(destIdx, 0), srcStatus);
  };

  const handleSaveTask = async (data, tagNames = []) => {
    try {
      if (modal.task) {
        await updateTask(modal.task.id, data, tagNames);
        toast.success("Task updated");
      } else {
        await createTask(
          { ...data, status: modal.status || "pending" },
          tagNames,
        );
        toast.success("Task created");
      }
      setModal({ open: false, status: null, task: null });
    } catch (err) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete");
      reload();
    }
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  if (projLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#08122e] via-[#031256] to-black">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading board...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#08122e] via-[#031256] to-black">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        {/* Board header */}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Back + title */}
          <div className="flex items-center  gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur-md bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </button>

            <div className="w-px h-6 bg-white/10" />
            <div>
              <h1 className="font-semibold text-xl text-white/90">
                {project?.name.charAt(0).toUpperCase() + project?.name.slice(1)}
              </h1>
              {project?.description && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex gap-2 flex-wrap">
            {COLUMNS.map((col) => (
              <span
                key={col.id}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/10"
              >
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                {col.label}: {colTasks(col.id).length}
              </span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>
              {totalTasks === 0
                ? "No Tasks"
                : completedTasks === totalTasks
                  ? "All Tasks Completed"
                  : `${completedTasks} / ${totalTasks} Tasks Completed`}
            </span>
          </div>
          <div className="w-[15rem] h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all durstion-500 cursor-pointer"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {activeTag && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-md text-gray-400">Filter by tag:</span>

            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${tasks.find((t) => t.tags?.some((tag) => tag.name === activeTag))?.tags?.find((tag) => tag.name === activeTag)?.color}22`,
                border: `1px solid ${tasks.find((t) => t.tags?.some((tag) => tag.name === activeTag))?.tags?.find((tag) => tag.name === activeTag)?.color}55`,
                color: tasks
                  .find((t) => t.tags?.some((tag) => tag.name === activeTag))
                  ?.tags?.find((tag) => tag.name === activeTag)?.color,
              }}
            >
              {activeTag}
              <button
                onClick={() => setActiveTag(null)}
                className="ml-1 text-xs hover:text-red-400"
              >
                ✕
              </button>
            </span>
          </div>
        )}

        {/* Kanban board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-4">
            {COLUMNS.map((col) => (
              <Column
                key={col.id}
                col={col}
                tasks={colTasks(col.id).filter(
                  (task) =>
                    !activeTag ||
                    task.tags?.some((tag) => tag.name === activeTag),
                )}
                onAdd={(status) => setModal({ open: true, status, task: null })}
                onEdit={(task) =>
                  setModal({ open: true, status: task.status, task })
                }
                onDelete={handleDeleteTask}
                onTagClick={setActiveTag}
              />
            ))}
          </div>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            <TaskOverlay task={activeTask} />
          </DragOverlay>
        </DndContext>
      </main>

      {modal.open && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.status}
          onClose={() => setModal({ open: false, status: null, task: null })}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

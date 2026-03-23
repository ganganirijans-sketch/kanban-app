import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
const PRIORITIES = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export default function TaskModal({ task, defaultStatus, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [desc, setDesc] = useState(task?.description ?? "");
  const [status, setStatus] = useState(
    task?.status ?? defaultStatus ?? "pending",
  );
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState(task?.tags?.map((tag) => tag.name) ?? []);
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!title.trim()) return;

  setLoading(true);

  try {
    let finalTasks = [...tags]

    if(tagInput.trim()){
      const newTags = tagInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)

      newTags.forEach((tag) => {
        if(!finalTasks.includes(tag)){
          finalTasks.push(tag)
        }
      })
    }
    await onSave(
      { title, description: desc, status, priority, due_date: dueDate || null},
      tags
    );
    onClose();
  } catch (err) {
    console.log("MAIN ERROR:", err);
  } finally {
    setLoading(false);
  }
};

const removeTag = (inddex) => {
  setTags((prev) => prev.filter((_, i) => i !== inddex))
}

  const priorityStyles = {
    low: {
      btn: "bg-green-100 border-green-400 text-green-700",
      plain: "border border-gray-300 text-gray-600",
    },
    medium: {
      btn: "bg-yellow-100 border-yellow-400 text-yellow-700",
      plain: "border border-gray-300 text-gray-600",
    },
    high: {
      btn: "bg-red-100 border-red-400 text-red-700",
      plain: "border border-gray-300 text-gray-600",
    },
  };
  return (
    <div
      className="fixed inset-0 z-50  bg-opacity-40 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="backdrop-blur-md bg-white/5 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-white">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">
              Title
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400">
              Tags
            </label>
            <div className="flex gap-1 flex-wrap mb-2">
              {tags.map((tag, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  {tag}
                  <button type='button' onClick={() => removeTag(i)} className="hover:text-white ml-1 pl-1 text-[11px]">x</button>
                </span>
              ))}
            </div>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} 
            onKeyDown={(e) =>{
              if(e.key === "Enter" && tagInput.trim()){
                e.preventDefault()
                if(!tags.includes(tagInput.trim().toLowerCase())){
                  setTags((prev) => [...prev, tagInput.trim().toLowerCase()]);
                }
                setTagInput("")
              }
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus" placeholder="Type Tag and hit Enter..." />
          </div>

          {/*  Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    priority === p.id
                      ? priorityStyles[p.id].btn
                      : "border-gray-400 text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

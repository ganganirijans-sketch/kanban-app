import { useState } from 'react'
import randomColor from 'randomcolor';

export default function ProjectModal({ onClose, onSave }) {
  const [name, setName]         = useState('')
  const [description, setDesc]  = useState('')
  const [color, setColor]       = useState(randomColor())
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try { await onSave({ name, description, color }) }
    finally { setLoading(false) }
  }

  return (
    <div
  className="fixed inset-0 z-50 bg-opacity-40 flex items-center justify-center p-4"
  onClick={e => e.target === e.currentTarget && onClose()}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

  {/* Modal */}
  <div className="relative w-full max-w-md bg-white/5 backdrop-blur-md  rounded-2xl"
  >
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
      <h2 className="text-lg font-semibold text-white/90">
        New Project
      </h2>

      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

      {/* Name */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">
          Project Name
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Task"
          className="w-full px-3 py-2.5 rounded-xl 
          bg-white/5 border border-white/10 
          text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 
          transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDesc(e.target.value)}
          placeholder="About Project"
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl 
          bg-white/5 border border-white/10 
          text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 
          transition resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl 
          border border-white/10 text-gray-300 
          hover:bg-white/10 transition"
        >
          Cancel
        </button>

        {/* Create */}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-[2] px-4 py-2.5 rounded-xl 
          text-white font-medium 
          transition-all disabled:opacity-50 disabled:cursor-not-allowed 
          shadow-lg"
          style={{ backgroundColor: color }}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>

      </div>
    </form>
  </div>
</div>
)}
    
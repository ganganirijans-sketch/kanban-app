import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider }    from './context/AuthContext'
import ProtectedRoute      from './components/ProtectedRoute'
import Login               from './pages/Login'
import Signup              from './pages/Signup'
import AuthCallback        from './pages/AuthCallback'
import Dashboard           from './pages/Dashboard'
import KanbanBoard         from './pages/KanbanBoard'
import SharedBoard         from './pages/SharedBoard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"         element={<Login />} />
          <Route path="/"         element={<Login />} />
          <Route path="/signup"        element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/share/:id"              element={<SharedBoard />} />
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/project/:id"   element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </AuthProvider>
  )
}

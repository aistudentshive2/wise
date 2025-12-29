import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import MyTasks from './pages/MyTasks'
import Companies from './pages/Companies'
import Employees from './pages/Employees'
import Reports from './pages/Reports'

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading, isAdmin } = useAuth()

    if (loading) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/my-tasks" replace />
    }

    return children
}

function AppRoutes() {
    const { user } = useAuth()

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<ProtectedRoute adminOnly><Tasks /></ProtectedRoute>} />
                <Route path="my-tasks" element={<MyTasks />} />
                <Route path="companies" element={<ProtectedRoute adminOnly><Companies /></ProtectedRoute>} />
                <Route path="employees" element={<ProtectedRoute adminOnly><Employees /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

function App() {
    return (
        <BrowserRouter basename="/wise">
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App

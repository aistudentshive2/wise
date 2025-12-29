import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    LayoutDashboard,
    ListTodo,
    ClipboardList,
    Building2,
    Users,
    BarChart3,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'

export default function Layout() {
    const { user, logout, isAdmin } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const { pendingTasksCount } = useTasks()

    const navigation = [
        { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
        { name: 'مهامي', href: '/my-tasks', icon: ClipboardList, showBadge: true },
        ...(isAdmin ? [
            { name: 'جميع المهام', href: '/tasks', icon: ListTodo },
            { name: 'الشركات', href: '/companies', icon: Building2 },
            { name: 'الموظفين', href: '/employees', icon: Users },
            { name: 'التقارير', href: '/reports', icon: BarChart3 },
        ] : [])
    ]

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="app-container">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="sidebar-logo">W</div>
                    <span className="font-semibold">Wise</span>
                </div>
                <div className="notification-bell">
                    <Bell size={22} />
                    {pendingTasksCount > 0 && (
                        <span className="notification-count">{pendingTasksCount}</span>
                    )}
                </div>
            </header>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">W</div>
                    <span className="sidebar-title">Wise</span>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setSidebarOpen(false)}
                        style={{ marginRight: 'auto', display: sidebarOpen ? 'flex' : 'none' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">القائمة الرئيسية</div>
                        {navigation.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                                end={item.href === '/'}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                                {item.showBadge && pendingTasksCount > 0 && (
                                    <span className="badge badge-critical" style={{ marginRight: 'auto' }}>
                                        {pendingTasksCount}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">
                            {user?.full_name_ar?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.full_name_ar || user?.username}</div>
                            <div className="user-role">
                                <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-employee'}`}>
                                    {isAdmin ? 'مدير' : 'موظف'}
                                </span>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="تسجيل الخروج">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}

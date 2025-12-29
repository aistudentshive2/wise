import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
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
    Bell,
    FolderTree
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'

export default function Layout() {
    const { user, logout, isAdmin } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { pendingTasksCount } = useTasks()

    const navigation = [
        { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
        { name: 'مهامي', href: '/my-tasks', icon: ClipboardList, showBadge: true },
        ...(isAdmin ? [
            { name: 'جميع المهام', href: '/tasks', icon: ListTodo },
            { name: 'أنواع المهام', href: '/categories', icon: FolderTree },
            { name: 'الشركات', href: '/companies', icon: Building2 },
            { name: 'الموظفين', href: '/employees', icon: Users },
            { name: 'التقارير', href: '/reports', icon: BarChart3 },
        ] : [])
    ]

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                    <Menu size={22} />
                </button>
                <div className="login-logo">W</div>
                <div className="notification-bell">
                    <Bell size={18} />
                    {pendingTasksCount > 0 && (
                        <span className="notification-badge">{pendingTasksCount}</span>
                    )}
                </div>
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 99 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="login-logo">W</div>
                    {sidebarOpen && (
                        <button
                            className="menu-btn"
                            onClick={() => setSidebarOpen(false)}
                            style={{ position: 'absolute', left: 8 }}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                            end={item.href === '/'}
                        >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                            {item.showBadge && pendingTasksCount > 0 && (
                                <span className="badge badge-critical" style={{ marginRight: 'auto' }}>
                                    {pendingTasksCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.full_name_ar?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.full_name_ar || user?.username}</div>
                            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-employee'}`} style={{ marginTop: 4 }}>
                                {isAdmin ? 'مدير' : 'موظف'}
                            </span>
                        </div>
                    </div>
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={logout}
                    >
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}

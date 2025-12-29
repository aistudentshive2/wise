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
    Bell
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
            { name: 'الشركات', href: '/companies', icon: Building2 },
            { name: 'الموظفين', href: '/employees', icon: Users },
            { name: 'التقارير', href: '/reports', icon: BarChart3 },
        ] : [])
    ]

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <div className="sidebar-logo">
                    <div className="login-logo" style={{ width: 36, height: 36, fontSize: '1rem' }}>W</div>
                    <span style={{ fontWeight: 600 }}>Wise</span>
                </div>
                <div className="notification-bell">
                    <Bell size={20} />
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
                    <div className="sidebar-logo">
                        <div className="login-logo" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>W</div>
                        <h1 style={{ fontSize: '1.5rem' }}>Wise</h1>
                    </div>
                    {sidebarOpen && (
                        <button
                            className="modal-close"
                            onClick={() => setSidebarOpen(false)}
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
                            <item.icon size={20} />
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
                            <div className="user-role">
                                <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-employee'}`}>
                                    {isAdmin ? 'مدير' : 'موظف'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%' }}>
                        <LogOut size={18} />
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

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
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
    FolderTree,
    Clock,
    AlertCircle
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'

export default function Layout() {
    const { user, logout, isAdmin } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const { pendingTasksCount, myPendingTasks } = useTasks()
    const navigate = useNavigate()

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

    const handleTaskClick = (taskId) => {
        setNotificationOpen(false)
        navigate('/my-tasks')
    }

    const priorityColors = {
        critical: '#e74c3c',
        high: '#e65100',
        medium: '#f39c12',
        low: '#27ae60'
    }

    const priorityLabels = {
        critical: 'حرج',
        high: 'عالي',
        medium: 'متوسط',
        low: 'منخفض'
    }

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                    <Menu size={22} />
                </button>
                <div className="login-logo">W</div>

                {/* Notification Bell - Only for employees with tasks */}
                {!isAdmin && pendingTasksCount > 0 && (
                    <div style={{ position: 'relative' }}>
                        <div
                            className="notification-bell"
                            onClick={() => setNotificationOpen(!notificationOpen)}
                        >
                            <Bell size={18} />
                            <span className="notification-badge">{pendingTasksCount}</span>
                        </div>
                    </div>
                )}
                {(isAdmin || pendingTasksCount === 0) && <div style={{ width: 32 }} />}
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 99 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Notification Dropdown */}
            {notificationOpen && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                        onClick={() => setNotificationOpen(false)}
                    />
                    <div style={{
                        position: 'fixed',
                        top: 56,
                        left: 12,
                        width: 300,
                        maxWidth: 'calc(100vw - 24px)',
                        background: 'white',
                        borderRadius: 8,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        zIndex: 999,
                        border: '1px solid #e0e4e8',
                        maxHeight: 400,
                        overflow: 'auto'
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #e0e4e8',
                            background: '#f5f6f8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <strong style={{ fontSize: 14 }}>المهام المعلقة ({pendingTasksCount})</strong>
                            <button
                                onClick={() => setNotificationOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9aaa' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {myPendingTasks?.slice(0, 5).map(task => (
                            <div
                                key={task.id}
                                onClick={() => handleTaskClick(task.id)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #e0e4e8',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f5f6f8'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <AlertCircle size={14} style={{ color: priorityColors[task.priority] }} />
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: priorityColors[task.priority]
                                    }}>
                                        {priorityLabels[task.priority]}
                                    </span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#2c3e50', marginBottom: 4 }}>
                                    {task.company?.name_ar || 'بدون شركة'}
                                </div>
                                <div style={{ fontSize: 12, color: '#5a6a7a' }}>
                                    {task.category?.task_type || task.description || 'مهمة جديدة'}
                                </div>
                                {task.status === 'open' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: '#3498db', fontSize: 11 }}>
                                        <Clock size={12} />
                                        <span>في انتظار البدء</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {myPendingTasks?.length > 5 && (
                            <div
                                onClick={() => { setNotificationOpen(false); navigate('/my-tasks'); }}
                                style={{
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    color: '#005bac',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                عرض كل المهام ({myPendingTasks.length})
                            </div>
                        )}
                    </div>
                </>
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
                            {item.showBadge && pendingTasksCount > 0 && !isAdmin && (
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

import {
    LayoutDashboard,
    Clock,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Calendar
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

const priorityLabels = {
    critical: 'حرج',
    high: 'عالي',
    medium: 'متوسط',
    low: 'منخفض'
}

const statusLabels = {
    open: 'مفتوح',
    in_progress: 'جاري العمل',
    done: 'مكتمل'
}

export default function Dashboard() {
    const { user, isAdmin } = useAuth()
    const { tasks, stats, loading } = useTasks()

    // Get recent tasks (last 5)
    const recentTasks = tasks.slice(0, 5)

    // Today's date in Arabic
    const today = format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })

    if (loading) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-title">
                    <LayoutDashboard size={28} style={{ color: 'var(--primary-400)' }} />
                    <div>
                        <h1>مرحباً، {user?.full_name_ar || user?.username}</h1>
                        <p className="text-muted text-sm">{today}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">إجمالي المهام</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon open">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.open}</div>
                        <div className="stat-label">مهام مفتوحة</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon progress">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">جاري العمل</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon done">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.done}</div>
                        <div className="stat-label">مهام مكتملة</div>
                    </div>
                </div>
            </div>

            {/* Priority Alerts */}
            {(stats.critical > 0 || stats.high > 0) && (
                <div className="card mb-4" style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))',
                    borderColor: 'rgba(239, 68, 68, 0.3)'
                }}>
                    <div className="card-body flex items-center gap-4">
                        <AlertTriangle size={24} style={{ color: 'var(--priority-critical)' }} />
                        <div>
                            <h4 style={{ color: 'var(--priority-critical)' }}>تنبيه المهام العاجلة</h4>
                            <p className="text-sm text-muted">
                                لديك {stats.critical} مهمة حرجة و {stats.high} مهمة ذات أولوية عالية تحتاج اهتمامك
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Tasks */}
            <div className="card">
                <div className="card-header">
                    <h3>آخر المهام</h3>
                </div>
                <div className="card-body">
                    {recentTasks.length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={48} />
                            <h3>لا توجد مهام</h3>
                            <p>لم يتم إضافة أي مهام بعد</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {recentTasks.map(task => (
                                <div key={task.id} className="task-card">
                                    <div className="task-card-header">
                                        <div>
                                            <div className="task-company">{task.company?.name_ar || 'غير محدد'}</div>
                                            <div className="task-type">{task.category?.task_type}</div>
                                        </div>
                                        <div className="task-meta">
                                            <span className={`badge badge-${task.status === 'in_progress' ? 'progress' : task.status}`}>
                                                {statusLabels[task.status]}
                                            </span>
                                            <span className={`badge badge-${task.priority}`}>
                                                {priorityLabels[task.priority]}
                                            </span>
                                        </div>
                                    </div>
                                    {task.description && (
                                        <div className="task-description">{task.description}</div>
                                    )}
                                    <div className="task-footer">
                                        <div className="task-assignee">
                                            {task.assignee && (
                                                <>
                                                    <span>المسؤول:</span>
                                                    <span style={{ color: 'white' }}>{task.assignee.full_name_ar}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="task-dates">
                                            {task.start_date && (
                                                <span>بدأ: {format(new Date(task.start_date), 'dd/MM/yyyy')}</span>
                                            )}
                                            {task.end_date && (
                                                <span>انتهى: {format(new Date(task.end_date), 'dd/MM/yyyy')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

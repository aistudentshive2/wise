import { useState } from 'react'
import {
    ClipboardList,
    Play,
    CheckCircle,
    Clock,
    Calendar
} from 'lucide-react'
import { useMyTasks } from '../hooks/useTasks'
import { useTasks } from '../hooks/useTasks'
import { format } from 'date-fns'

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

export default function MyTasks() {
    const { tasks, loading, refetch } = useMyTasks()
    const { updateTaskStatus } = useTasks()
    const [filter, setFilter] = useState('all')
    const [updating, setUpdating] = useState(null)

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        return task.status === filter
    })

    const handleStatusChange = async (task, newStatus) => {
        setUpdating(task.id)
        await updateTaskStatus(task.id, newStatus, task.status)
        await refetch()
        setUpdating(null)
    }

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
                    <ClipboardList size={28} style={{ color: 'var(--primary-400)' }} />
                    <h1>مهامي</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label>الحالة:</label>
                    <select
                        className="form-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">جميع المهام</option>
                        <option value="open">مفتوح</option>
                        <option value="in_progress">جاري العمل</option>
                        <option value="done">مكتمل</option>
                    </select>
                </div>
            </div>

            {/* Task Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('open')}>
                    <div className="stat-icon open">
                        <Clock size={20} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{tasks.filter(t => t.status === 'open').length}</div>
                        <div className="stat-label">مفتوح</div>
                    </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('in_progress')}>
                    <div className="stat-icon progress">
                        <Play size={20} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{tasks.filter(t => t.status === 'in_progress').length}</div>
                        <div className="stat-label">جاري العمل</div>
                    </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('done')}>
                    <div className="stat-icon done">
                        <CheckCircle size={20} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{tasks.filter(t => t.status === 'done').length}</div>
                        <div className="stat-label">مكتمل</div>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Calendar size={48} />
                        <h3>لا توجد مهام</h3>
                        <p>{filter === 'all' ? 'لم يتم تكليفك بأي مهام بعد' : 'لا توجد مهام بهذه الحالة'}</p>
                    </div>
                </div>
            ) : (
                <div className="task-list">
                    {filteredTasks.map(task => (
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
                                <div className="task-dates">
                                    {task.start_date && (
                                        <span>بدأ: {format(new Date(task.start_date), 'dd/MM/yyyy')}</span>
                                    )}
                                    {task.end_date && (
                                        <span>انتهى: {format(new Date(task.end_date), 'dd/MM/yyyy')}</span>
                                    )}
                                </div>

                                {/* Status Change Buttons */}
                                <div className="flex gap-2">
                                    {task.status === 'open' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStatusChange(task, 'in_progress')}
                                            disabled={updating === task.id}
                                        >
                                            {updating === task.id ? (
                                                <div className="loading-spinner" style={{ width: 14, height: 14 }}></div>
                                            ) : (
                                                <>
                                                    <Play size={14} />
                                                    <span>ابدأ العمل</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {task.status === 'in_progress' && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleStatusChange(task, 'done')}
                                            disabled={updating === task.id}
                                        >
                                            {updating === task.id ? (
                                                <div className="loading-spinner" style={{ width: 14, height: 14 }}></div>
                                            ) : (
                                                <>
                                                    <CheckCircle size={14} />
                                                    <span>تم الانتهاء</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

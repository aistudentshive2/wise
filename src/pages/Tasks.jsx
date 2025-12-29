import { useState } from 'react'
import {
    ListTodo,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Calendar
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useCompanies } from '../hooks/useCompanies'
import { useEmployees } from '../hooks/useEmployees'
import { useCategories } from '../hooks/useCategories'
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

const initialTaskForm = {
    company_id: '',
    category_id: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assigned_to: '',
    reviewed_by: '',
    notes: ''
}

export default function Tasks() {
    const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()
    const { companies } = useCompanies()
    const { employees } = useEmployees()
    const { categories, groupedCategories } = useCategories()

    const [showModal, setShowModal] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [formData, setFormData] = useState(initialTaskForm)
    const [formError, setFormError] = useState('')
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [assigneeFilter, setAssigneeFilter] = useState('all')

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = !searchTerm ||
            task.company?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category?.task_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
        const matchesAssignee = assigneeFilter === 'all' || task.assigned_to === assigneeFilter

        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })

    const openCreateModal = () => {
        setEditingTask(null)
        setFormData(initialTaskForm)
        setFormError('')
        setShowModal(true)
    }

    const openEditModal = (task) => {
        setEditingTask(task)
        setFormData({
            company_id: task.company_id || '',
            category_id: task.category_id || '',
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            assigned_to: task.assigned_to || '',
            reviewed_by: task.reviewed_by || '',
            notes: task.notes || ''
        })
        setFormError('')
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        if (!formData.company_id) {
            setFormError('الرجاء اختيار الشركة')
            return
        }
        if (!formData.category_id) {
            setFormError('الرجاء اختيار نوع المهمة')
            return
        }

        setSaving(true)

        const taskData = {
            ...formData,
            assigned_to: formData.assigned_to || null,
            reviewed_by: formData.reviewed_by || null
        }

        let result
        if (editingTask) {
            result = await updateTask(editingTask.id, taskData)
        } else {
            result = await createTask(taskData)
        }

        setSaving(false)

        if (result.error) {
            setFormError(result.error)
        } else {
            setShowModal(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return

        setDeleting(id)
        await deleteTask(id)
        setDeleting(null)
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
                    <ListTodo size={28} style={{ color: 'var(--primary-400)' }} />
                    <h1>إدارة المهام</h1>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    <span>إضافة مهمة</span>
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group" style={{ flex: 1 }}>
                    <div className="search-input-wrapper" style={{ flex: 1 }}>
                        <Search />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="بحث عن مهمة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <label>الحالة:</label>
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">الكل</option>
                        <option value="open">مفتوح</option>
                        <option value="in_progress">جاري العمل</option>
                        <option value="done">مكتمل</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>الأولوية:</label>
                    <select
                        className="form-select"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="all">الكل</option>
                        <option value="critical">حرج</option>
                        <option value="high">عالي</option>
                        <option value="medium">متوسط</option>
                        <option value="low">منخفض</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>المسؤول:</label>
                    <select
                        className="form-select"
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                    >
                        <option value="all">الكل</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.full_name_ar}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Calendar size={48} />
                        <h3>لا توجد مهام</h3>
                        <p>لم يتم العثور على مهام مطابقة لمعايير البحث</p>
                    </div>
                </div>
            ) : (
                <div className="task-list">
                    {filteredTasks.map(task => (
                        <div key={task.id} className="task-card">
                            <div className="task-card-header">
                                <div>
                                    <div className="task-company">{task.company?.name_ar || 'غير محدد'}</div>
                                    <div className="task-type">
                                        {task.category?.classification} - {task.category?.task_type}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
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

                                <div className="flex items-center gap-3">
                                    <div className="task-dates">
                                        {task.start_date && (
                                            <span>بدأ: {format(new Date(task.start_date), 'dd/MM/yyyy')}</span>
                                        )}
                                        {task.end_date && (
                                            <span>انتهى: {format(new Date(task.end_date), 'dd/MM/yyyy')}</span>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => openEditModal(task)}
                                        title="تعديل"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleDelete(task.id)}
                                        disabled={deleting === task.id}
                                        title="حذف"
                                        style={{ color: 'var(--priority-critical)' }}
                                    >
                                        {deleting === task.id ? (
                                            <div className="loading-spinner" style={{ width: 16, height: 16 }}></div>
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingTask ? 'تعديل مهمة' : 'إضافة مهمة جديدة'}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {formError && (
                                    <div className="mb-4" style={{
                                        padding: 'var(--space-3)',
                                        background: 'var(--priority-critical-bg)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'var(--priority-critical)',
                                        fontSize: '0.875rem'
                                    }}>
                                        {formError}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label">الشركة *</label>
                                        <select
                                            className="form-select"
                                            value={formData.company_id}
                                            onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                        >
                                            <option value="">اختر الشركة</option>
                                            {companies.map(company => (
                                                <option key={company.id} value={company.id}>{company.name_ar}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">نوع المهمة *</label>
                                        <select
                                            className="form-select"
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        >
                                            <option value="">اختر نوع المهمة</option>
                                            {Object.entries(groupedCategories).map(([classification, cats]) => (
                                                <optgroup key={classification} label={classification}>
                                                    {cats.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.task_type}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">وصف المهمة / الفترة</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="مثال: إقرار قيمة مضافة شهر 11-2025"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label">الأولوية</label>
                                        <select
                                            className="form-select"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">منخفض</option>
                                            <option value="medium">متوسط</option>
                                            <option value="high">عالي</option>
                                            <option value="critical">حرج</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">الحالة</label>
                                        <select
                                            className="form-select"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="open">مفتوح</option>
                                            <option value="in_progress">جاري العمل</option>
                                            <option value="done">مكتمل</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label">المسؤول عن التنفيذ</label>
                                        <select
                                            className="form-select"
                                            value={formData.assigned_to}
                                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                        >
                                            <option value="">اختر الموظف</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.full_name_ar}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">المراجع</label>
                                        <select
                                            className="form-select"
                                            value={formData.reviewed_by}
                                            onChange={(e) => setFormData({ ...formData, reviewed_by: e.target.value })}
                                        >
                                            <option value="">اختر المراجع</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.full_name_ar}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">ملاحظات</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="ملاحظات إضافية..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <div className="loading-spinner" style={{ width: 16, height: 16 }}></div>
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <span>{editingTask ? 'حفظ التعديلات' : 'إضافة المهمة'}</span>
                                    )}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

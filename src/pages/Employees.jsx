import { useState } from 'react'
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Eye,
    EyeOff
} from 'lucide-react'
import { useEmployees } from '../hooks/useEmployees'

const initialForm = {
    username: '',
    password_hash: '',
    full_name_ar: '',
    full_name_en: '',
    role: 'employee'
}

export default function Employees() {
    const { employees, loading, createEmployee, updateEmployee, deleteEmployee } = useEmployees()

    const [showModal, setShowModal] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState(null)
    const [formData, setFormData] = useState(initialForm)
    const [formError, setFormError] = useState('')
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const filteredEmployees = employees.filter(emp =>
        !searchTerm ||
        emp.full_name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.full_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const openCreateModal = () => {
        setEditingEmployee(null)
        setFormData(initialForm)
        setFormError('')
        setShowPassword(false)
        setShowModal(true)
    }

    const openEditModal = (employee) => {
        setEditingEmployee(employee)
        setFormData({
            username: employee.username || '',
            password_hash: '', // Don't show password when editing
            full_name_ar: employee.full_name_ar || '',
            full_name_en: employee.full_name_en || '',
            role: employee.role || 'employee'
        })
        setFormError('')
        setShowPassword(false)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        if (!formData.username) {
            setFormError('الرجاء إدخال اسم المستخدم')
            return
        }
        if (!formData.full_name_ar) {
            setFormError('الرجاء إدخال الاسم بالعربي')
            return
        }
        if (!editingEmployee && !formData.password_hash) {
            setFormError('الرجاء إدخال كلمة السر')
            return
        }

        setSaving(true)

        const employeeData = { ...formData }
        // If editing and password is empty, don't update it
        if (editingEmployee && !employeeData.password_hash) {
            delete employeeData.password_hash
        }

        let result
        if (editingEmployee) {
            result = await updateEmployee(editingEmployee.id, employeeData)
        } else {
            result = await createEmployee(employeeData)
        }

        setSaving(false)

        if (result.error) {
            setFormError(result.error)
        } else {
            setShowModal(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return

        setDeleting(id)
        await deleteEmployee(id)
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
                    <Users size={28} style={{ color: 'var(--primary-400)' }} />
                    <h1>إدارة الموظفين</h1>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    <span>إضافة موظف</span>
                </button>
            </div>

            {/* Search */}
            <div className="filters-bar">
                <div className="filter-group" style={{ flex: 1 }}>
                    <div className="search-input-wrapper" style={{ flex: 1 }}>
                        <Search />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="بحث عن موظف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>اسم المستخدم</th>
                            <th>الصلاحية</th>
                            <th style={{ width: '100px' }}>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                    <div className="text-muted">لا يوجد موظفين</div>
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="user-avatar"
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: '0.875rem',
                                                    background: emp.role === 'admin'
                                                        ? 'linear-gradient(135deg, var(--primary-500), var(--primary-700))'
                                                        : 'linear-gradient(135deg, var(--accent-500), var(--accent-700))'
                                                }}
                                            >
                                                {emp.full_name_ar?.charAt(0) || emp.username?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{emp.full_name_ar}</div>
                                                {emp.full_name_en && (
                                                    <div className="text-sm text-muted">{emp.full_name_en}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td dir="ltr" style={{ textAlign: 'right' }}>{emp.username}</td>
                                    <td>
                                        <span className={`badge ${emp.role === 'admin' ? 'badge-admin' : 'badge-employee'}`}>
                                            {emp.role === 'admin' ? 'مدير' : 'موظف'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => openEditModal(emp)}
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleDelete(emp.id)}
                                                disabled={deleting === emp.id}
                                                title="حذف"
                                                style={{ color: 'var(--priority-critical)' }}
                                            >
                                                {deleting === emp.id ? (
                                                    <div className="loading-spinner" style={{ width: 16, height: 16 }}></div>
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}
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

                                <div className="form-group">
                                    <label className="form-label">الاسم بالعربي *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="مثال: محمد احمد"
                                        value={formData.full_name_ar}
                                        onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">الاسم بالإنجليزي</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Example: Mohamed Ahmed"
                                        value={formData.full_name_en}
                                        onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">اسم المستخدم *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="مثال: mohamed.ahmed"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        كلمة السر {editingEmployee ? '(اتركها فارغة للحفاظ على الحالية)' : '*'}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-input"
                                            style={{ paddingLeft: '40px' }}
                                            placeholder="كلمة السر"
                                            value={formData.password_hash}
                                            onChange={(e) => setFormData({ ...formData, password_hash: e.target.value })}
                                            dir="ltr"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-icon"
                                            style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)' }}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">الصلاحية</label>
                                    <select
                                        className="form-select"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="employee">موظف</option>
                                        <option value="admin">مدير</option>
                                    </select>
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
                                        <span>{editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف'}</span>
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

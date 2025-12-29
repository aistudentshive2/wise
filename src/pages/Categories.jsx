import { useState } from 'react'
import {
    FolderTree,
    Plus,
    Edit2,
    Trash2,
    X,
    Search
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { supabase } from '../lib/supabase'

export default function Categories() {
    const { categories, groupedCategories, loading, refetch } = useCategories()
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        classification: '',
        task_type: ''
    })
    const [error, setError] = useState('')

    const classifications = [
        'إقرارات ضريبية',
        'مراجعة',
        'تسجيل حسابات',
        'فحص ضريبي',
        'تأسيس الشركات',
        'مستخرجات رسمية',
        'التأمينات الاجتماعية',
        'أخرى'
    ]

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category)
            setFormData({
                classification: category.classification,
                task_type: category.task_type
            })
        } else {
            setEditingCategory(null)
            setFormData({ classification: '', task_type: '' })
        }
        setError('')
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingCategory(null)
        setFormData({ classification: '', task_type: '' })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.classification || !formData.task_type) {
            setError('يرجى ملء جميع الحقول المطلوبة')
            return
        }

        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('task_categories')
                    .update(formData)
                    .eq('id', editingCategory.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('task_categories')
                    .insert([formData])

                if (error) throw error
            }

            handleCloseModal()
            refetch()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return

        try {
            const { error } = await supabase
                .from('task_categories')
                .delete()
                .eq('id', id)

            if (error) throw error
            refetch()
        } catch (err) {
            alert('حدث خطأ أثناء الحذف: ' + err.message)
        }
    }

    const filteredCategories = categories.filter(cat =>
        cat.classification.includes(searchTerm) ||
        cat.task_type.includes(searchTerm)
    )

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
                    <FolderTree size={26} />
                    <h1>أنواع المهام</h1>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    <span>إضافة نوع جديد</span>
                </button>
            </div>

            {/* Search */}
            <div className="filters-bar">
                <div className="filter-group" style={{ flex: 1 }}>
                    <Search size={18} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="بحث في أنواع المهام..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ minWidth: '250px' }}
                    />
                </div>
                <div className="text-muted text-sm">
                    إجمالي الأنواع: {categories.length}
                </div>
            </div>

            {/* Categories by Classification */}
            {Object.entries(groupedCategories).map(([classification, types]) => (
                <div key={classification} className="card mb-4">
                    <div className="card-header">
                        <h3>{classification}</h3>
                        <span className="badge badge-open">{types.length} نوع</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>نوع المهمة</th>
                                    <th style={{ width: '120px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {types
                                    .filter(cat =>
                                        searchTerm === '' ||
                                        cat.task_type.includes(searchTerm)
                                    )
                                    .map(category => (
                                        <tr key={category.id}>
                                            <td>{category.task_type}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-secondary btn-sm btn-icon"
                                                        onClick={() => handleOpenModal(category)}
                                                        title="تعديل"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm btn-icon"
                                                        onClick={() => handleDelete(category.id)}
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {categories.length === 0 && (
                <div className="empty-state">
                    <FolderTree />
                    <h3>لا توجد أنواع مهام</h3>
                    <p>ابدأ بإضافة أنواع المهام لتتمكن من إنشاء مهام جديدة</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? 'تعديل نوع المهمة' : 'إضافة نوع مهمة جديد'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}

                                <div className="form-group">
                                    <label className="form-label">التصنيف *</label>
                                    <select
                                        className="form-select"
                                        value={formData.classification}
                                        onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                                        required
                                    >
                                        <option value="">اختر التصنيف</option>
                                        {classifications.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">نوع المهمة *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.task_type}
                                        onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                                        placeholder="مثال: إقرار ضريبة القيمة المضافة"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'حفظ التعديلات' : 'إضافة'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
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

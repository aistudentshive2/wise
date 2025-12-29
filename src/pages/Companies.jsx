import { useState } from 'react'
import {
    Building2,
    Plus,
    Search,
    Edit2,
    Trash2,
    X
} from 'lucide-react'
import { useCompanies } from '../hooks/useCompanies'

const legalEntities = [
    'مسئولية محدودة',
    'مسئولية محدودة - صيني',
    'مساهمة',
    'فردي',
    'توصية بسيطة',
    'تضامن'
]

const sectors = [
    'تصنيع',
    'خدمات اعلان',
    'طبي',
    'ثروة عقارية',
    'مطاعم',
    'تجارة وإستيراد',
    'تجارة',
    'اسمدة زراعية',
    'خدمات',
    'مقاولات',
    'استشارات',
    'تكنولوجيا'
]

const taxAuthorities = [
    'الاستثمار',
    'المساهمة بالقاهرة',
    'عابدين',
    '6 أكتوبر',
    'الجيزة ثان',
    'كبار ثان',
    'شبرا الخيمة ثان',
    'الوايلي',
    'المطرية',
    'السيدة زينب'
]

const initialForm = {
    name_ar: '',
    name_en: '',
    legal_entity: '',
    sector: '',
    tax_authority: ''
}

export default function Companies() {
    const { companies, loading, createCompany, updateCompany, deleteCompany } = useCompanies()

    const [showModal, setShowModal] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)
    const [formData, setFormData] = useState(initialForm)
    const [formError, setFormError] = useState('')
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCompanies = companies.filter(company =>
        !searchTerm ||
        company.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const openCreateModal = () => {
        setEditingCompany(null)
        setFormData(initialForm)
        setFormError('')
        setShowModal(true)
    }

    const openEditModal = (company) => {
        setEditingCompany(company)
        setFormData({
            name_ar: company.name_ar || '',
            name_en: company.name_en || '',
            legal_entity: company.legal_entity || '',
            sector: company.sector || '',
            tax_authority: company.tax_authority || ''
        })
        setFormError('')
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        if (!formData.name_ar) {
            setFormError('الرجاء إدخال اسم الشركة')
            return
        }

        setSaving(true)

        let result
        if (editingCompany) {
            result = await updateCompany(editingCompany.id, formData)
        } else {
            result = await createCompany(formData)
        }

        setSaving(false)

        if (result.error) {
            setFormError(result.error)
        } else {
            setShowModal(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الشركة؟')) return

        setDeleting(id)
        await deleteCompany(id)
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
                    <Building2 size={28} style={{ color: 'var(--primary-400)' }} />
                    <h1>إدارة الشركات</h1>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    <span>إضافة شركة</span>
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
                            placeholder="بحث عن شركة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Companies Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>اسم الشركة</th>
                            <th>الكيان القانوني</th>
                            <th>القطاع</th>
                            <th>المأمورية</th>
                            <th style={{ width: '100px' }}>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                    <div className="text-muted">لا توجد شركات</div>
                                </td>
                            </tr>
                        ) : (
                            filteredCompanies.map(company => (
                                <tr key={company.id}>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{company.name_ar}</div>
                                            {company.name_en && (
                                                <div className="text-sm text-muted">{company.name_en}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>{company.legal_entity || '-'}</td>
                                    <td>{company.sector || '-'}</td>
                                    <td>{company.tax_authority || '-'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => openEditModal(company)}
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleDelete(company.id)}
                                                disabled={deleting === company.id}
                                                title="حذف"
                                                style={{ color: 'var(--priority-critical)' }}
                                            >
                                                {deleting === company.id ? (
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
                                {editingCompany ? 'تعديل شركة' : 'إضافة شركة جديدة'}
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
                                    <label className="form-label">اسم الشركة بالعربي *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="مثال: شركة المحاسبة المتحدة"
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">اسم الشركة بالإنجليزي</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Example: United Accounting Co."
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">الكيان القانوني</label>
                                    <select
                                        className="form-select"
                                        value={formData.legal_entity}
                                        onChange={(e) => setFormData({ ...formData, legal_entity: e.target.value })}
                                    >
                                        <option value="">اختر الكيان القانوني</option>
                                        {legalEntities.map(entity => (
                                            <option key={entity} value={entity}>{entity}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">القطاع</label>
                                    <select
                                        className="form-select"
                                        value={formData.sector}
                                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                    >
                                        <option value="">اختر القطاع</option>
                                        {sectors.map(sector => (
                                            <option key={sector} value={sector}>{sector}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">المأمورية</label>
                                    <select
                                        className="form-select"
                                        value={formData.tax_authority}
                                        onChange={(e) => setFormData({ ...formData, tax_authority: e.target.value })}
                                    >
                                        <option value="">اختر المأمورية</option>
                                        {taxAuthorities.map(auth => (
                                            <option key={auth} value={auth}>{auth}</option>
                                        ))}
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
                                        <span>{editingCompany ? 'حفظ التعديلات' : 'إضافة الشركة'}</span>
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

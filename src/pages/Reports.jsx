import { useState, useMemo } from 'react'
import {
    BarChart3,
    Calendar,
    Download,
    FileSpreadsheet,
    FileText,
    Filter
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useEmployees } from '../hooks/useEmployees'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

export default function Reports() {
    const { tasks, loading } = useTasks()
    const { employees } = useEmployees()

    const [reportType, setReportType] = useState('weekly')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [employeeFilter, setEmployeeFilter] = useState('all')

    // Calculate date ranges
    const dateRange = useMemo(() => {
        const now = new Date()
        if (reportType === 'weekly') {
            return {
                start: startOfWeek(now, { weekStartsOn: 0 }),
                end: endOfWeek(now, { weekStartsOn: 0 })
            }
        } else if (reportType === 'monthly') {
            return {
                start: startOfMonth(now),
                end: endOfMonth(now)
            }
        } else if (reportType === 'custom' && customStartDate && customEndDate) {
            return {
                start: parseISO(customStartDate),
                end: parseISO(customEndDate)
            }
        }
        return null
    }, [reportType, customStartDate, customEndDate])

    // Filter tasks by date range and employee
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Employee filter
            if (employeeFilter !== 'all' && task.assigned_to !== employeeFilter) {
                return false
            }

            // Date filter
            if (dateRange) {
                const taskDate = task.created_at ? parseISO(task.created_at) : null
                if (taskDate && !isWithinInterval(taskDate, { start: dateRange.start, end: dateRange.end })) {
                    return false
                }
            }

            return true
        })
    }, [tasks, dateRange, employeeFilter])

    // Calculate report stats
    const reportStats = useMemo(() => {
        const total = filteredTasks.length
        const completed = filteredTasks.filter(t => t.status === 'done').length
        const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length
        const open = filteredTasks.filter(t => t.status === 'open').length
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        // By employee
        const byEmployee = employees.map(emp => {
            const empTasks = filteredTasks.filter(t => t.assigned_to === emp.id)
            const empCompleted = empTasks.filter(t => t.status === 'done').length
            return {
                employee: emp,
                total: empTasks.length,
                completed: empCompleted,
                rate: empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0
            }
        }).filter(e => e.total > 0)

        // By priority
        const byPriority = {
            critical: filteredTasks.filter(t => t.priority === 'critical').length,
            high: filteredTasks.filter(t => t.priority === 'high').length,
            medium: filteredTasks.filter(t => t.priority === 'medium').length,
            low: filteredTasks.filter(t => t.priority === 'low').length
        }

        return { total, completed, inProgress, open, completionRate, byEmployee, byPriority }
    }, [filteredTasks, employees])

    // Export to Excel
    const exportToExcel = () => {
        const data = filteredTasks.map(task => ({
            'الشركة': task.company?.name_ar || '-',
            'نوع المهمة': task.category?.task_type || '-',
            'التصنيف': task.category?.classification || '-',
            'الوصف': task.description || '-',
            'الأولوية': priorityLabels[task.priority],
            'الحالة': statusLabels[task.status],
            'المسؤول': task.assignee?.full_name_ar || '-',
            'تاريخ البدء': task.start_date ? format(parseISO(task.start_date), 'dd/MM/yyyy') : '-',
            'تاريخ الانتهاء': task.end_date ? format(parseISO(task.end_date), 'dd/MM/yyyy') : '-',
            'ملاحظات': task.notes || '-'
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'التقرير')

        const filename = `wise-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
        XLSX.writeFile(wb, filename)
    }

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4')

        // Add Arabic font support (simplified - in production use proper Arabic font)
        doc.setFont('helvetica')

        // Title
        doc.setFontSize(18)
        doc.text('Wise - Task Report', 14, 22)

        doc.setFontSize(11)
        const reportPeriod = dateRange
            ? `${format(dateRange.start, 'dd/MM/yyyy')} - ${format(dateRange.end, 'dd/MM/yyyy')}`
            : 'All Time'
        doc.text(`Period: ${reportPeriod}`, 14, 30)
        doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36)

        // Stats
        doc.text(`Total Tasks: ${reportStats.total} | Completed: ${reportStats.completed} | Completion Rate: ${reportStats.completionRate}%`, 14, 44)

        // Table
        const tableData = filteredTasks.map(task => [
            task.company?.name_ar || '-',
            task.category?.task_type || '-',
            priorityLabels[task.priority],
            statusLabels[task.status],
            task.assignee?.full_name_ar || '-',
            task.start_date ? format(parseISO(task.start_date), 'dd/MM/yyyy') : '-',
            task.end_date ? format(parseISO(task.end_date), 'dd/MM/yyyy') : '-'
        ])

        doc.autoTable({
            startY: 50,
            head: [['Company', 'Task Type', 'Priority', 'Status', 'Assignee', 'Start Date', 'End Date']],
            body: tableData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [30, 64, 175] }
        })

        const filename = `wise-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        doc.save(filename)
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
                    <BarChart3 size={28} style={{ color: 'var(--primary-400)' }} />
                    <h1>التقارير</h1>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary" onClick={exportToExcel}>
                        <FileSpreadsheet size={18} />
                        <span>تصدير Excel</span>
                    </button>
                    <button className="btn btn-primary" onClick={exportToPDF}>
                        <FileText size={18} />
                        <span>تصدير PDF</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label>نوع التقرير:</label>
                    <select
                        className="form-select"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="weekly">أسبوعي</option>
                        <option value="monthly">شهري</option>
                        <option value="custom">فترة محددة</option>
                    </select>
                </div>

                {reportType === 'custom' && (
                    <>
                        <div className="filter-group">
                            <label>من:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                style={{ minWidth: '160px' }}
                            />
                        </div>
                        <div className="filter-group">
                            <label>إلى:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                style={{ minWidth: '160px' }}
                            />
                        </div>
                    </>
                )}

                <div className="filter-group">
                    <label>الموظف:</label>
                    <select
                        className="form-select"
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                    >
                        <option value="all">جميع الموظفين</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.full_name_ar}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Report Period Display */}
            {dateRange && (
                <div className="card mb-4" style={{
                    background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                    borderColor: 'var(--primary-700)'
                }}>
                    <div className="card-body flex items-center gap-4">
                        <Calendar size={24} style={{ color: 'var(--primary-400)' }} />
                        <div>
                            <h4>فترة التقرير</h4>
                            <p className="text-muted">
                                {format(dateRange.start, 'EEEE، d MMMM yyyy', { locale: ar })} - {format(dateRange.end, 'EEEE، d MMMM yyyy', { locale: ar })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{reportStats.total}</div>
                        <div className="stat-label">إجمالي المهام</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon done">
                        <Download size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{reportStats.completed}</div>
                        <div className="stat-label">مهام مكتملة</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon progress">
                        <Filter size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{reportStats.inProgress}</div>
                        <div className="stat-label">جاري العمل</div>
                    </div>
                </div>

                <div className="stat-card" style={{
                    background: reportStats.completionRate >= 70
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))'
                        : reportStats.completionRate >= 40
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))'
                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                    borderColor: reportStats.completionRate >= 70
                        ? 'var(--accent-600)'
                        : reportStats.completionRate >= 40
                            ? 'var(--status-open)'
                            : 'var(--priority-critical)'
                }}>
                    <div className="stat-content">
                        <div className="stat-value" style={{
                            color: reportStats.completionRate >= 70
                                ? 'var(--accent-400)'
                                : reportStats.completionRate >= 40
                                    ? 'var(--status-open)'
                                    : 'var(--priority-critical)'
                        }}>
                            {reportStats.completionRate}%
                        </div>
                        <div className="stat-label">معدل الإنجاز</div>
                    </div>
                </div>
            </div>

            {/* Employee Performance */}
            {reportStats.byEmployee.length > 0 && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h3>أداء الموظفين</h3>
                    </div>
                    <div className="card-body">
                        <div className="table-container" style={{ border: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>الموظف</th>
                                        <th>إجمالي المهام</th>
                                        <th>المهام المكتملة</th>
                                        <th>معدل الإنجاز</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportStats.byEmployee.map(item => (
                                        <tr key={item.employee.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="user-avatar"
                                                        style={{ width: 32, height: 32, fontSize: '0.75rem' }}
                                                    >
                                                        {item.employee.full_name_ar?.charAt(0)}
                                                    </div>
                                                    <span>{item.employee.full_name_ar}</span>
                                                </div>
                                            </td>
                                            <td>{item.total}</td>
                                            <td>{item.completed}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div style={{
                                                        width: '100px',
                                                        height: '8px',
                                                        background: 'var(--neutral-700)',
                                                        borderRadius: 'var(--radius-full)',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${item.rate}%`,
                                                            height: '100%',
                                                            background: item.rate >= 70
                                                                ? 'var(--accent-500)'
                                                                : item.rate >= 40
                                                                    ? 'var(--status-open)'
                                                                    : 'var(--priority-critical)',
                                                            borderRadius: 'var(--radius-full)',
                                                            transition: 'width 0.5s ease'
                                                        }} />
                                                    </div>
                                                    <span className="text-sm">{item.rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Priority Breakdown */}
            <div className="card">
                <div className="card-header">
                    <h3>توزيع الأولويات</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--priority-critical-bg)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--priority-critical)' }}>
                                {reportStats.byPriority.critical}
                            </div>
                            <div style={{ color: 'var(--priority-critical)', fontSize: '0.875rem' }}>حرج</div>
                        </div>
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--priority-high-bg)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--priority-high)' }}>
                                {reportStats.byPriority.high}
                            </div>
                            <div style={{ color: 'var(--priority-high)', fontSize: '0.875rem' }}>عالي</div>
                        </div>
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--priority-medium-bg)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--priority-medium)' }}>
                                {reportStats.byPriority.medium}
                            </div>
                            <div style={{ color: 'var(--priority-medium)', fontSize: '0.875rem' }}>متوسط</div>
                        </div>
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--priority-low-bg)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--priority-low)' }}>
                                {reportStats.byPriority.low}
                            </div>
                            <div style={{ color: 'var(--priority-low)', fontSize: '0.875rem' }}>منخفض</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

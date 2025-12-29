import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Lock, User, AlertCircle } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!username || !password) {
            setError('الرجاء إدخال اسم المستخدم وكلمة السر')
            return
        }

        setLoading(true)
        const result = await login(username, password)
        setLoading(false)

        if (result.error) {
            setError(result.error)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">W</div>
                    <h1>Wise</h1>
                    <p>نظام إدارة المهام</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">اسم المستخدم</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#8a9aaa'
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingRight: 36 }}
                                placeholder="أدخل اسم المستخدم"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">كلمة السر</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#8a9aaa'
                            }} />
                            <input
                                type="password"
                                className="form-input"
                                style={{ paddingRight: 36 }}
                                placeholder="أدخل كلمة السر"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                <span>جاري الدخول...</span>
                            </>
                        ) : (
                            <span>تسجيل الدخول</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

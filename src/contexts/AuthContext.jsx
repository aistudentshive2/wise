import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for saved session
        const savedUser = localStorage.getItem('wise_user')
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('username', username)
                .eq('is_active', true)
                .single()

            if (error || !data) {
                return { error: 'اسم المستخدم غير موجود' }
            }

            // In production, use proper password hashing
            // For now, we'll store password hash in the database
            const { data: authData, error: authError } = await supabase
                .from('employees')
                .select('*')
                .eq('username', username)
                .eq('password_hash', password)
                .eq('is_active', true)
                .single()

            if (authError || !authData) {
                return { error: 'كلمة السر غير صحيحة' }
            }

            const userData = {
                id: authData.id,
                username: authData.username,
                full_name_ar: authData.full_name_ar,
                full_name_en: authData.full_name_en,
                role: authData.role
            }

            setUser(userData)
            localStorage.setItem('wise_user', JSON.stringify(userData))
            return { data: userData }
        } catch (err) {
            return { error: 'حدث خطأ في الاتصال' }
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('wise_user')
    }

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'admin'
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

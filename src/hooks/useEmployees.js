import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEmployees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('is_active', true)
                .order('full_name_ar')

            if (error) throw error
            setEmployees(data || [])
        } catch (err) {
            console.error('Error fetching employees:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchEmployees()
    }, [fetchEmployees])

    const createEmployee = async (employeeData) => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .insert([employeeData])
                .select()
                .single()

            if (error) throw error
            await fetchEmployees()
            return { data }
        } catch (err) {
            return { error: err.message }
        }
    }

    const updateEmployee = async (id, employeeData) => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .update({ ...employeeData, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            await fetchEmployees()
            return { data }
        } catch (err) {
            return { error: err.message }
        }
    }

    const deleteEmployee = async (id) => {
        try {
            const { error } = await supabase
                .from('employees')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error
            await fetchEmployees()
            return { success: true }
        } catch (err) {
            return { error: err.message }
        }
    }

    return {
        employees,
        loading,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee
    }
}

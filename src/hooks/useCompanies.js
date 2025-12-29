import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCompanies() {
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('is_active', true)
                .order('name_ar')

            if (error) throw error
            setCompanies(data || [])
        } catch (err) {
            console.error('Error fetching companies:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCompanies()
    }, [fetchCompanies])

    const createCompany = async (companyData) => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .insert([companyData])
                .select()
                .single()

            if (error) throw error
            await fetchCompanies()
            return { data }
        } catch (err) {
            return { error: err.message }
        }
    }

    const updateCompany = async (id, companyData) => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .update({ ...companyData, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            await fetchCompanies()
            return { data }
        } catch (err) {
            return { error: err.message }
        }
    }

    const deleteCompany = async (id) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error
            await fetchCompanies()
            return { success: true }
        } catch (err) {
            return { error: err.message }
        }
    }

    return {
        companies,
        loading,
        fetchCompanies,
        createCompany,
        updateCompany,
        deleteCompany
    }
}

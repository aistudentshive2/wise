import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('task_categories')
                .select('*')
                .eq('is_active', true)
                .order('classification')
                .order('task_type')

            if (error) throw error
            setCategories(data || [])
        } catch (err) {
            console.error('Error fetching categories:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // Group categories by classification
    const groupedCategories = categories.reduce((acc, cat) => {
        if (!acc[cat.classification]) {
            acc[cat.classification] = []
        }
        acc[cat.classification].push(cat)
        return acc
    }, {})

    return {
        categories,
        groupedCategories,
        loading,
        fetchCategories
    }
}

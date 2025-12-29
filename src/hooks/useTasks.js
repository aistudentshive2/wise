import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useTasks() {
    const { user, isAdmin } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchTasks = useCallback(async () => {
        if (!user) return

        try {
            setLoading(true)
            let query = supabase
                .from('tasks')
                .select(`
          *,
          company:companies(id, name_ar, name_en),
          category:task_categories(id, classification, task_type),
          assignee:employees!tasks_assigned_to_fkey(id, full_name_ar, full_name_en, username),
          reviewer:employees!tasks_reviewed_by_fkey(id, full_name_ar, full_name_en, username)
        `)
                .order('created_at', { ascending: false })

            // If not admin, only show assigned tasks
            if (!isAdmin) {
                query = query.eq('assigned_to', user.id)
            }

            const { data, error } = await query

            if (error) throw error
            setTasks(data || [])
        } catch (err) {
            setError(err.message)
            console.error('Error fetching tasks:', err)
        } finally {
            setLoading(false)
        }
    }, [user, isAdmin])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const createTask = async (taskData) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([{ ...taskData, created_by: user.id }])
                .select()
                .single()

            if (error) throw error
            await fetchTasks()
            return { data }
        } catch (err) {
            return { error: err.message }
        }
    }

    const updateTask = async (id, taskData) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update({ ...taskData, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            await fetchTasks()
            return { data }
        } catch (err) {
            return { error: err.message }
        }
    }

    const updateTaskStatus = async (id, status, oldStatus) => {
        try {
            const updates = {
                status,
                updated_at: new Date().toISOString()
            }

            // Set start_date when moving to in_progress
            if (status === 'in_progress' && oldStatus === 'open') {
                updates.start_date = new Date().toISOString()
            }

            // Set end_date when marking as done
            if (status === 'done') {
                updates.end_date = new Date().toISOString()
            }

            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            // Log the status change
            await supabase.from('task_history').insert([{
                task_id: id,
                changed_by: user.id,
                old_status: oldStatus,
                new_status: status
            }])

            await fetchTasks()
            return { data }
        } catch (err) {
            return { error: err.message }
        }
    }

    const deleteTask = async (id) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchTasks()
            return { success: true }
        } catch (err) {
            return { error: err.message }
        }
    }

    // Calculate stats
    const stats = {
        total: tasks.length,
        open: tasks.filter(t => t.status === 'open').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        critical: tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length,
        high: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length
    }

    // Pending tasks for notification
    const pendingTasksCount = isAdmin
        ? tasks.filter(t => t.status !== 'done').length
        : tasks.filter(t => t.assigned_to === user?.id && t.status !== 'done').length

    return {
        tasks,
        loading,
        error,
        stats,
        pendingTasksCount,
        fetchTasks,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask
    }
}

export function useMyTasks() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchMyTasks = useCallback(async () => {
        if (!user) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          company:companies(id, name_ar, name_en),
          category:task_categories(id, classification, task_type)
        `)
                .eq('assigned_to', user.id)
                .order('priority', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error
            setTasks(data || [])
        } catch (err) {
            console.error('Error fetching my tasks:', err)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchMyTasks()
    }, [fetchMyTasks])

    return { tasks, loading, refetch: fetchMyTasks }
}

import { supabase } from '../config/supabase';

// Transform camelCase to snake_case for database
const toDbFormat = (data) => ({
  department: data.department,
  process_name: data.processName,
  description: data.description,
  current_time: data.currentTime,
  estimated_time_after_automation: data.estimatedTimeAfterAutomation,
  frequency: data.frequency,
  programs: Array.isArray(data.programs) ? data.programs :
    (typeof data.programs === 'string' ? data.programs.split(',').map(p => p.trim()).filter(p => p) : []),
  submitted_by: data.submittedBy,
  email: data.email || null,
  priority: data.priority,
  status: data.status || 'Pending Review',
  notes: data.notes || ''
});

// Transform snake_case to camelCase for components
const toComponentFormat = (data) => ({
  id: data.id,
  department: data.department,
  processName: data.process_name,
  description: data.description,
  currentTime: data.current_time,
  estimatedTimeAfterAutomation: data.estimated_time_after_automation,
  frequency: data.frequency,
  programs: Array.isArray(data.programs) ? data.programs : [],
  submittedBy: data.submitted_by,
  email: data.email || '',
  priority: data.priority,
  status: data.status,
  notes: data.notes || '',
  date: data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
});

/**
 * Create a new workflow
 * @param {object} workflowData - Workflow data in camelCase format
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export const createWorkflow = async (workflowData) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .insert([toDbFormat(workflowData)])
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow:', error);
      return { data: null, error };
    }

    return { data: toComponentFormat(data), error: null };
  } catch (error) {
    console.error('Error creating workflow:', error);
    return { data: null, error };
  }
};

/**
 * Get all workflows
 * @returns {Promise<{data: array, error: object|null}>}
 */
export const getWorkflows = async () => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflows:', error);
      return { data: [], error };
    }

    return {
      data: data ? data.map(toComponentFormat) : [],
      error: null
    };
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return { data: [], error };
  }
};

/**
 * Update an existing workflow
 * @param {string} id - Workflow ID (UUID)
 * @param {object} updates - Updated workflow data in camelCase format
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export const updateWorkflow = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .update(toDbFormat(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow:', error);
      return { data: null, error };
    }

    return { data: toComponentFormat(data), error: null };
  } catch (error) {
    console.error('Error updating workflow:', error);
    return { data: null, error };
  }
};

/**
 * Delete a workflow
 * @param {string} id - Workflow ID (UUID)
 * @returns {Promise<{error: object|null}>}
 */
export const deleteWorkflow = async (id) => {
  try {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workflow:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return { error };
  }
};

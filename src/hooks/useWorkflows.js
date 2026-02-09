import { useState, useEffect } from 'react';
import { getWorkflows } from '../services/workflowService';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getWorkflows();

    if (fetchError) {
      setError(fetchError);
      console.error('Error fetching workflows:', fetchError);
    } else {
      setWorkflows(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return {
    workflows,
    loading,
    error,
    refetch: fetchWorkflows
  };
};

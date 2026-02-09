import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Clock, Users, Package, Download, Edit2, Trash2, BarChart3, DollarSign, X, LogOut } from 'lucide-react';
import { DEPARTMENTS, FREQUENCIES, PRIORITIES, STATUSES } from '../utils/constants';
import { createWorkflow, updateWorkflow, deleteWorkflow } from '../services/workflowService';
import { getHourlyRate, updateHourlyRate } from '../services/settingsService';
import { useWorkflows } from '../hooks/useWorkflows';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const { workflows: fetchedWorkflows, loading: workflowsLoading, refetch } = useWorkflows();
  const { signOut } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [hourlyRate, setHourlyRate] = useState(50);
  const [showCharts, setShowCharts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    processName: '',
    description: '',
    currentTime: '',
    estimatedTimeAfterAutomation: '',
    frequency: 'Daily',
    programs: '',
    submittedBy: '',
    priority: 'Medium',
    status: 'Pending Review',
    notes: ''
  });

  const departments = ['All', ...DEPARTMENTS];
  const frequencies = FREQUENCIES;
  const priorities = ['All', ...PRIORITIES];
  const statuses = ['All', ...STATUSES];

  // Load workflows from Supabase
  useEffect(() => {
    if (fetchedWorkflows) {
      setWorkflows(fetchedWorkflows);
    }
  }, [fetchedWorkflows]);

  // Load hourly rate from Supabase
  useEffect(() => {
    const fetchHourlyRate = async () => {
      const { data } = await getHourlyRate();
      if (data) {
        setHourlyRate(data);
      }
    };
    fetchHourlyRate();
  }, []);

  // Update hourly rate in Supabase
  const handleHourlyRateChange = async (newRate) => {
    setHourlyRate(newRate);
    await updateHourlyRate(newRate);
  };

  const handleSubmit = async () => {
    if (!formData.department || !formData.processName || !formData.description ||
        !formData.currentTime || !formData.estimatedTimeAfterAutomation || !formData.submittedBy || !formData.programs) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    const submission = {
      ...formData,
      currentTime: parseInt(formData.currentTime),
      estimatedTimeAfterAutomation: parseInt(formData.estimatedTimeAfterAutomation),
    };

    if (editingId) {
      // Update existing workflow
      const { error } = await updateWorkflow(editingId, submission);
      if (error) {
        alert('Failed to update workflow');
        setSubmitting(false);
        return;
      }
    } else {
      // Add new workflow
      const { error } = await createWorkflow(submission);
      if (error) {
        alert('Failed to create workflow');
        setSubmitting(false);
        return;
      }
    }

    await refetch();
    resetForm();
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      department: '',
      processName: '',
      description: '',
      currentTime: '',
      estimatedTimeAfterAutomation: '',
      frequency: 'Daily',
      programs: '',
      submittedBy: '',
      priority: 'Medium',
      status: 'Pending Review',
      notes: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (workflow) => {
    setFormData({
      ...workflow,
      currentTime: workflow.currentTime.toString(),
      estimatedTimeAfterAutomation: workflow.estimatedTimeAfterAutomation.toString(),
      programs: workflow.programs.join(', ')
    });
    setEditingId(workflow.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      const { error } = await deleteWorkflow(id);
      if (error) {
        alert('Failed to delete workflow');
        return;
      }
      await refetch();
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const exportToCSV = () => {
    const headers = ['Department', 'Process Name', 'Description', 'Current Time (min)', 'Automated Time (min)',
                     'Time Saved (min)', 'Frequency', 'Annual Hours Saved', 'Annual Cost Savings', 'Programs',
                     'Priority', 'Status', 'Submitted By', 'Date', 'Notes'];

    const rows = workflows.map(w => {
      const multiplier = w.frequency === 'Daily' ? 260 : w.frequency === 'Weekly' ? 52 : w.frequency === 'Monthly' ? 12 : 4;
      const timeSaved = w.currentTime - w.estimatedTimeAfterAutomation;
      const annualHours = (timeSaved * multiplier) / 60;
      const costSavings = annualHours * hourlyRate;

      return [
        w.department,
        w.processName,
        w.description,
        w.currentTime,
        w.estimatedTimeAfterAutomation,
        timeSaved,
        w.frequency,
        annualHours.toFixed(2),
        `$${costSavings.toFixed(2)}`,
        w.programs.join('; '),
        w.priority,
        w.status,
        w.submittedBy,
        w.date,
        w.notes || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = workflows.filter(w => {
      const matchesSearch = w.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           w.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'All' || w.department === filterDept;
      const matchesStatus = filterStatus === 'All' || w.status === filterStatus;
      const matchesPriority = filterPriority === 'All' || w.priority === filterPriority;
      return matchesSearch && matchesDept && matchesStatus && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'time-saved':
          const aMultiplier = a.frequency === 'Daily' ? 260 : a.frequency === 'Weekly' ? 52 : a.frequency === 'Monthly' ? 12 : 4;
          const bMultiplier = b.frequency === 'Daily' ? 260 : b.frequency === 'Weekly' ? 52 : b.frequency === 'Monthly' ? 12 : 4;
          return ((b.currentTime - b.estimatedTimeAfterAutomation) * bMultiplier) -
                 ((a.currentTime - a.estimatedTimeAfterAutomation) * aMultiplier);
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  }, [workflows, searchTerm, filterDept, filterStatus, filterPriority, sortBy]);

  const stats = useMemo(() => {
    const totalTimeSaved = workflows.reduce((sum, w) => {
      const multiplier = w.frequency === 'Daily' ? 260 : w.frequency === 'Weekly' ? 52 : w.frequency === 'Monthly' ? 12 : 4;
      return sum + ((w.currentTime - w.estimatedTimeAfterAutomation) * multiplier);
    }, 0);

    const totalHours = totalTimeSaved / 60;
    const totalCostSavings = totalHours * hourlyRate;

    const programUsage = {};
    workflows.forEach(w => {
      w.programs.forEach(p => {
        programUsage[p] = (programUsage[p] || 0) + 1;
      });
    });

    const topPrograms = Object.entries(programUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const deptStats = DEPARTMENTS.map(dept => {
      const deptWorkflows = workflows.filter(w => w.department === dept);
      const deptTimeSaved = deptWorkflows.reduce((sum, w) => {
        const multiplier = w.frequency === 'Daily' ? 260 : w.frequency === 'Weekly' ? 52 : w.frequency === 'Monthly' ? 12 : 4;
        return sum + ((w.currentTime - w.estimatedTimeAfterAutomation) * multiplier);
      }, 0);
      return { dept, count: deptWorkflows.length, timeSaved: deptTimeSaved };
    }).filter(d => d.count > 0);

    const statusCounts = STATUSES.map(status => ({
      status,
      count: workflows.filter(w => w.status === status).length
    }));

    return {
      totalWorkflows: workflows.length,
      totalTimeSaved: Math.round(totalTimeSaved),
      totalHours: Math.round(totalHours),
      totalCostSavings: Math.round(totalCostSavings),
      avgTimeSaved: workflows.length > 0 ? Math.round(workflows.reduce((sum, w) => sum + (w.currentTime - w.estimatedTimeAfterAutomation), 0) / workflows.length) : 0,
      topPrograms,
      deptStats,
      statusCounts
    };
  }, [workflows, hourlyRate]);

  if (workflowsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Automation Tracker</h1>
            <p className="text-gray-600">Identify automation opportunities and track software usage across departments</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Hourly Rate Setting */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <label className="text-sm font-medium text-gray-700">Hourly Labor Rate:</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => handleHourlyRateChange(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">Used to calculate cost savings</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Workflows</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalWorkflows}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Annual Hours Saved</h3>
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalHours.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Annual Cost Savings</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${stats.totalCostSavings.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Programs Tracked</h3>
              <Package className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.topPrograms.length}</p>
          </div>
        </div>

        {/* Charts Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            {showCharts ? 'Hide' : 'Show'} Department Analytics
          </button>
        </div>

        {/* Department Charts */}
        {showCharts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflows by Department</h2>
              <div className="space-y-3">
                {stats.deptStats.map(({ dept, count }) => (
                  <div key={dept} className="flex items-center">
                    <div className="w-32 text-sm font-medium text-gray-700">{dept}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / workflows.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Annual Hours Saved by Department</h2>
              <div className="space-y-3">
                {stats.deptStats.map(({ dept, timeSaved }) => {
                  const maxTime = Math.max(...stats.deptStats.map(d => d.timeSaved));
                  return (
                    <div key={dept} className="flex items-center">
                      <div className="w-32 text-sm font-medium text-gray-700">{dept}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(timeSaved / maxTime) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{Math.round(timeSaved / 60)}h</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
              <div className="space-y-3">
                {stats.statusCounts.filter(s => s.count > 0).map(({ status, count }) => (
                  <div key={status} className="flex items-center">
                    <div className="w-40 text-sm font-medium text-gray-700">{status}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'Automated' ? 'bg-green-500' :
                            status === 'In Progress' ? 'bg-yellow-500' :
                            status === 'Pending Review' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(count / workflows.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Programs Section */}
        {stats.topPrograms.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Used Programs</h2>
            <div className="space-y-3">
              {stats.topPrograms.map(([program, count]) => (
                <div key={program} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700">{program}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / workflows.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{count} workflow{count !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search workflows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(pri => (
                      <option key={pri} value={pri}>Priority: {pri}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="time-saved">Most Time Saved</option>
                    <option value="priority">Highest Priority</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Workflow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Workflow' : 'Submit New Workflow'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={formData.submittedBy}
                      onChange={(e) => setFormData({...formData, submittedBy: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Process Name *</label>
                  <input
                    type="text"
                    value={formData.processName}
                    onChange={(e) => setFormData({...formData, processName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Time (minutes) *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.currentTime}
                      onChange={(e) => setFormData({...formData, currentTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Est. Time After Automation *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimatedTimeAfterAutomation}
                      onChange={(e) => setFormData({...formData, estimatedTimeAfterAutomation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    >
                      {frequencies.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Programs Used *</label>
                    <input
                      type="text"
                      placeholder="e.g., Power BI, OpenInvoice, SAP"
                      value={formData.programs}
                      onChange={(e) => setFormData({...formData, programs: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    >
                      {PRIORITIES.map(pri => (
                        <option key={pri} value={pri}>{pri}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                    placeholder="Add any notes about automation progress, vendors, technical details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : editingId ? 'Update Workflow' : 'Submit Workflow'}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={submitting}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="space-y-4">
              {filteredAndSortedWorkflows.map(workflow => {
                const multiplier = workflow.frequency === 'Daily' ? 260 : workflow.frequency === 'Weekly' ? 52 : workflow.frequency === 'Monthly' ? 12 : 4;
                const timeSaved = workflow.currentTime - workflow.estimatedTimeAfterAutomation;
                const annualHours = (timeSaved * multiplier) / 60;
                const costSavings = annualHours * hourlyRate;

                return (
                  <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{workflow.processName}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            workflow.priority === 'High' ? 'bg-red-100 text-red-700' :
                            workflow.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {workflow.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            workflow.status === 'Automated' ? 'bg-green-100 text-green-700' :
                            workflow.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            workflow.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {workflow.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{workflow.description}</p>
                        {workflow.notes && (
                          <p className="text-sm text-gray-500 italic mb-3">Note: {workflow.notes}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {workflow.programs.map((program, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                              {program}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {workflow.department} • {workflow.submittedBy} • {workflow.date}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col items-end gap-2 min-w-48">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Current Time</div>
                            <div className="text-2xl font-bold text-gray-900">{workflow.currentTime} min</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">After Automation</div>
                            <div className="text-2xl font-bold text-green-600">{workflow.estimatedTimeAfterAutomation} min</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-purple-600">
                              Saves {timeSaved} min ({workflow.frequency})
                            </div>
                          </div>
                          <div className="text-right border-t pt-2">
                            <div className="text-xs text-gray-500">Annual Savings</div>
                            <div className="text-lg font-bold text-green-600">${Math.round(costSavings).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{Math.round(annualHours)} hours/year</div>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(workflow)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(workflow.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAndSortedWorkflows.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No workflows found matching your filters. {workflows.length > 0 ? 'Try adjusting your filters.' : 'Add a new workflow to get started.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

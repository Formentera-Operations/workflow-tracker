import React, { useState } from 'react';
import { Send, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const WorkflowSubmissionForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    processName: '',
    description: '',
    currentTime: '',
    estimatedTimeAfterAutomation: '',
    frequency: 'Daily',
    programs: '',
    submittedBy: '',
    priority: 'Medium'
  });

  const departments = ['Accounting', 'Operations', 'Engineering', 'HR', 'IT', 'Legal', 'Supply Chain'];
  const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
  const priorities = ['Low', 'Medium', 'High'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.department || !formData.processName || !formData.description || 
        !formData.currentTime || !formData.estimatedTimeAfterAutomation || !formData.submittedBy || !formData.programs) {
      alert('Please fill in all required fields');
      return;
    }

    // Get existing submissions from localStorage
    const existingSubmissions = JSON.parse(localStorage.getItem('workflowSubmissions') || '[]');
    
    // Create new submission
    const newSubmission = {
      id: existingSubmissions.length > 0 ? Math.max(...existingSubmissions.map(s => s.id)) + 1 : 1,
      ...formData,
      currentTime: parseInt(formData.currentTime),
      estimatedTimeAfterAutomation: parseInt(formData.estimatedTimeAfterAutomation),
      programs: formData.programs.split(',').map(p => p.trim()),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Review'
    };

    // Save to localStorage
    localStorage.setItem('workflowSubmissions', JSON.stringify([...existingSubmissions, newSubmission]));

    // Show success message
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        department: '',
        processName: '',
        description: '',
        currentTime: '',
        estimatedTimeAfterAutomation: '',
        frequency: 'Daily',
        programs: '',
        submittedBy: '',
        priority: 'Medium'
      });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Submission Successful!</h2>
          <p className="text-gray-600 text-lg">
            Thank you for submitting your workflow automation idea. Your submission has been received and will be reviewed by the automation team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Workflow Automation Submission</h1>
          <p className="text-lg text-gray-600">
            Help us identify processes that can be automated to save time and improve efficiency
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
            <p className="text-sm text-gray-600">Identify repetitive tasks that take significant time</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Increase Efficiency</h3>
            <p className="text-sm text-gray-600">Automate processes to focus on strategic work</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Send className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Quick & Easy</h3>
            <p className="text-sm text-gray-600">Simple form submission, we'll handle the rest</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Workflow</h2>
          
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.submittedBy}
                  onChange={(e) => handleChange('submittedBy', e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                >
                  <option value="">Select Your Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Process Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Process/Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.processName}
                onChange={(e) => handleChange('processName', e.target.value)}
                placeholder="e.g., Invoice Reconciliation, Daily Production Report"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the workflow step-by-step. What tasks are involved? What makes this process time-consuming?"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-sm text-gray-500 mt-1">Be as specific as possible to help us understand the process</p>
            </div>

            {/* Time & Frequency */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Time Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Time (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.currentTime}
                    onChange={(e) => handleChange('currentTime', e.target.value)}
                    placeholder="40"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">How long does this take now?</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Time After Automation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedTimeAfterAutomation}
                    onChange={(e) => handleChange('estimatedTimeAfterAutomation', e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your best estimate</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                  >
                    {frequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">How often do you do this?</p>
                </div>
              </div>

              {/* Time Savings Preview */}
              {formData.currentTime && formData.estimatedTimeAfterAutomation && (
                <div className="mt-4 bg-white rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Potential Time Savings:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {parseInt(formData.currentTime) - parseInt(formData.estimatedTimeAfterAutomation)} minutes per task
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Programs & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Programs/Software Used <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.programs}
                  onChange={(e) => handleChange('programs', e.target.value)}
                  placeholder="e.g., Excel, SAP, Power BI, OpenInvoice"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple programs with commas</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                >
                  {priorities.map(pri => (
                    <option key={pri} value={pri}>{pri}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">How urgent is this automation?</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <Send className="w-5 h-5" />
                Submit Workflow
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Your submission will be reviewed by the automation team. Thank you for helping us improve efficiency!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSubmissionForm;
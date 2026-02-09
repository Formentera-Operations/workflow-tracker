import { FREQUENCY_MULTIPLIERS } from './constants';

/**
 * Get the annual occurrence multiplier for a given frequency
 * @param {string} frequency - 'Daily', 'Weekly', 'Monthly', or 'Quarterly'
 * @returns {number} - Annual occurrence count
 */
export const getFrequencyMultiplier = (frequency) => {
  return FREQUENCY_MULTIPLIERS[frequency] || 1;
};

/**
 * Calculate time saved per occurrence
 * @param {number} currentTime - Current time in minutes
 * @param {number} automatedTime - Automated time in minutes
 * @returns {number} - Time saved in minutes
 */
export const calculateTimeSaved = (currentTime, automatedTime) => {
  return Math.max(0, currentTime - automatedTime);
};

/**
 * Calculate annual hours saved
 * @param {number} timeSaved - Time saved per occurrence in minutes
 * @param {string} frequency - 'Daily', 'Weekly', 'Monthly', or 'Quarterly'
 * @returns {number} - Annual hours saved
 */
export const calculateAnnualHours = (timeSaved, frequency) => {
  const multiplier = getFrequencyMultiplier(frequency);
  return (timeSaved * multiplier) / 60;
};

/**
 * Calculate cost savings based on hourly rate
 * @param {number} annualHours - Annual hours saved
 * @param {number} hourlyRate - Hourly rate in dollars
 * @returns {number} - Annual cost savings in dollars
 */
export const calculateCostSavings = (annualHours, hourlyRate) => {
  return annualHours * hourlyRate;
};

/**
 * Calculate all metrics for a workflow
 * @param {object} workflow - Workflow object with currentTime, estimatedTimeAfterAutomation, frequency
 * @param {number} hourlyRate - Hourly rate in dollars
 * @returns {object} - Object with timeSaved, annualHours, and costSavings
 */
export const calculateWorkflowMetrics = (workflow, hourlyRate) => {
  const timeSaved = calculateTimeSaved(
    workflow.currentTime,
    workflow.estimatedTimeAfterAutomation
  );
  const annualHours = calculateAnnualHours(timeSaved, workflow.frequency);
  const costSavings = calculateCostSavings(annualHours, hourlyRate);

  return {
    timeSaved,
    annualHours,
    costSavings
  };
};

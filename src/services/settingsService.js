import { supabase } from '../config/supabase';

/**
 * Get the hourly rate setting
 * @returns {Promise<{data: number, error: object|null}>}
 */
export const getHourlyRate = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'hourly_rate')
      .single();

    if (error) {
      console.error('Error fetching hourly rate:', error);
      return { data: 50, error }; // Default to 50 if error
    }

    return {
      data: data ? parseFloat(data.setting_value) : 50,
      error: null
    };
  } catch (error) {
    console.error('Error fetching hourly rate:', error);
    return { data: 50, error };
  }
};

/**
 * Update the hourly rate setting
 * @param {number} rate - New hourly rate
 * @returns {Promise<{error: object|null}>}
 */
export const updateHourlyRate = async (rate) => {
  try {
    const { error } = await supabase
      .from('app_settings')
      .update({ setting_value: rate.toString() })
      .eq('setting_key', 'hourly_rate');

    if (error) {
      console.error('Error updating hourly rate:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating hourly rate:', error);
    return { error };
  }
};

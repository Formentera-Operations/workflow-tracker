import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DepartmentBarChart = ({ deptStats }) => {
  const data = deptStats.map(d => ({
    department: d.dept,
    workflows: d.count,
    hoursSaved: Math.round(d.timeSaved / 60),
  }));

  if (data.length === 0) return <p className="text-gray-500 text-center py-8">No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="department" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="workflows" fill="#3B82F6" name="Workflows" />
        <Bar dataKey="hoursSaved" fill="#10B981" name="Hours Saved/Year" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DepartmentBarChart;

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const STATUS_COLORS = {
  'Pending Review': '#3B82F6',
  'In Progress': '#F59E0B',
  'Automated': '#10B981',
  'Rejected': '#EF4444',
};

const StatusPieChart = ({ statusCounts }) => {
  const data = statusCounts.filter(s => s.count > 0);

  if (data.length === 0) return <p className="text-gray-500 text-center py-8">No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ status, count }) => `${status}: ${count}`}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6B7280'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusPieChart;

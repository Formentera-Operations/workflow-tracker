import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgramsBarChart = ({ topPrograms }) => {
  const data = topPrograms.map(([program, count]) => ({
    program,
    workflows: count,
  }));

  if (data.length === 0) return <p className="text-gray-500 text-center py-8">No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="program" tick={{ fontSize: 12 }} width={75} />
        <Tooltip />
        <Bar dataKey="workflows" fill="#8B5CF6" name="Workflows" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgramsBarChart;

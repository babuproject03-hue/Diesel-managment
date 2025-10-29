
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartPanelProps {
  title: string;
  data: any[];
  type: 'line' | 'area' | 'pie';
}

const COLORS = ['#0B4C6B', '#FF8C42', '#4CAF50', '#F44336', '#9C27B0'];

const ChartPanel: React.FC<ChartPanelProps> = ({ title, data, type }) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#0B4C6B" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="expenses" stroke="#FF8C42" />
          </LineChart>
        );
      case 'area':
        return (
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="liters" stroke="#0B4C6B" fill="#0B4C6B" fillOpacity={0.6} />
            </AreaChart>
        );
      case 'pie':
        return (
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        )
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96">
      <h3 className="font-bold text-lg text-slate-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPanel;

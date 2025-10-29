
import React, { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, change, changeType }) => {
  const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        {change && (
          <p className={`text-xs mt-2 ${changeColor}`}>{change}</p>
        )}
      </div>
      <div className="bg-diesel-blue/10 text-diesel-blue p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default KPICard;

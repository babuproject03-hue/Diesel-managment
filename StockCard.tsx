
import React from 'react';
import type { Stock } from '../types';

interface StockCardProps {
  stock: Stock;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const percentage = (stock.current_liters / stock.capacity_liters) * 100;
  const progressBarColor = percentage < 20 ? 'bg-red-500' : percentage < 50 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">{stock.tank_id.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
        <span className="text-sm font-medium text-slate-500">{stock.product}</span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-slate-600 mb-1">
          <span>{stock.current_liters.toLocaleString()} L</span>
          <span>{stock.capacity_liters.toLocaleString()} L</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div className={`${progressBarColor} h-3 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-right text-2xl font-bold text-diesel-blue mt-2">{percentage.toFixed(1)}%</p>
      </div>
      <div className="mt-4 text-xs text-slate-400">
        Last Refill: {new Date(stock.last_refill_date).toLocaleDateString()}
      </div>
    </div>
  );
};

export default StockCard;

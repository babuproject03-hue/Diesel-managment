import React from 'react';
import KPICard from '../components/KPICard';
import StockCard from '../components/StockCard';
import ChartPanel from '../components/ChartPanel';
import TransactionTable, { StatusPill } from '../components/TransactionTable';
import { DollarSignIcon, FuelIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import type { Income } from '../types';

const Dashboard: React.FC = () => {
  const { income: incomeData, expenses: expenseData, stock: stockData } = useAppContext();

  const todayIncome = incomeData
    .filter(i => new Date(i.date).toDateString() === new Date().toDateString())
    .reduce((sum, i) => sum + i.amount, 0);

  const todayExpenses = expenseData
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount, 0);

  const totalStock = stockData.reduce((sum, s) => sum + s.current_liters, 0);
  
  const incomeTrendData = [
    { name: 'Oct 21', income: 40000, expenses: 24000 },
    { name: 'Oct 22', income: 30000, expenses: 13980 },
    { name: 'Oct 23', income: 20000, expenses: 98000 },
    { name: 'Oct 24', income: 27800, expenses: 39080 },
    { name: 'Oct 25', income: 18900, expenses: 48000 },
    { name: 'Oct 26', income: 23900, expenses: 38000 },
    { name: 'Oct 27', income: 34900, expenses: 43000 },
  ];

  const recentTransactions = [...incomeData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const transactionCols = [
      { header: 'Reference', accessor: (item: Income) => <span className="font-medium text-slate-800">{item.reference}</span> },
      { header: 'Customer', accessor: (item: Income) => item.customer },
      { header: 'Date', accessor: (item: Income) => new Date(item.date).toLocaleDateString() },
      { header: 'Amount', accessor: (item: Income) => `₹${item.amount.toLocaleString()}`, className: 'font-medium text-slate-900 text-right' },
      { header: 'Status', accessor: (item: Income) => <StatusPill status={item.payment_status} /> },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Today's Income" 
          value={`₹${todayIncome.toLocaleString()}`} 
          icon={<DollarSignIcon />} 
          change="+5.4% vs yesterday"
          changeType="increase"
        />
        <KPICard 
          title="Today's Expenses" 
          value={`₹${todayExpenses.toLocaleString()}`} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m16 8-8 8"/><path d="m8 8 8 8"/></svg>}
          change="+12.1% vs yesterday"
          changeType="decrease"
        />
        <KPICard 
          title="Net" 
          value={`₹${(todayIncome - todayExpenses).toLocaleString()}`} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>}
          change="-2.2% vs yesterday"
          changeType="decrease"
        />
        <KPICard 
          title="Current Stock" 
          value={`${totalStock.toLocaleString()} L`} 
          icon={<FuelIcon />} 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <ChartPanel title="Income vs Expenses" data={incomeTrendData} type="line" />
        </div>
        <div className="space-y-6">
          {stockData.slice(0, 3).map(stock => (
            <StockCard key={stock.tank_id} stock={stock} />
          ))}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div>
        <TransactionTable title="Recent Income Transactions" data={recentTransactions} columns={transactionCols} />
      </div>
    </div>
  );
};

export default Dashboard;
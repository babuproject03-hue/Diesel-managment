import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionTable, { StatusPill } from '../components/TransactionTable';
import { useAppContext } from '../context/AppContext';
import type { Income } from '../types';
import { SearchIcon } from '../components/Icons';

const Income: React.FC = () => {
    const navigate = useNavigate();
    const { income: incomeData } = useAppContext();

    const handleAddNewIncome = () => {
        navigate('/income/new');
    };

    const columns = [
        { header: 'Reference', accessor: (item: Income) => <span className="font-medium text-slate-800">{item.reference}</span> },
        { header: 'Customer', accessor: (item: Income) => item.customer },
        { header: 'Vehicle', accessor: (item: Income) => item.vehicle },
        { header: 'Date', accessor: (item: Income) => new Date(item.date).toLocaleDateString() },
        { header: 'Liters', accessor: (item: Income) => item.liters.toFixed(2), className: 'text-right' },
        { header: 'Amount', accessor: (item: Income) => `₹${item.amount.toLocaleString()}`, className: 'font-medium text-slate-900 text-right' },
        { header: 'Status', accessor: (item: Income) => <StatusPill status={item.payment_status} /> },
    ];

    const renderIncomeActions = (item: Income) => (
        <div className="flex justify-end gap-4">
            <button 
                onClick={() => alert(`Viewing details for ${item.reference}`)}
                className="font-medium text-gray-600 hover:underline"
            >
                View
            </button>
            <button 
                onClick={() => alert(`Editing ${item.reference}`)}
                className="font-medium text-diesel-blue hover:underline"
            >
                Edit
            </button>
            <button 
                onClick={() => confirm(`Are you sure you want to delete ${item.reference}?`)}
                className="font-medium text-red-600 hover:underline"
            >
                Delete
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="relative w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search by customer, vehicle..."
                        className="pl-10 pr-4 py-2 border rounded-md w-full md:w-80"
                    />
                </div>
                <button onClick={handleAddNewIncome} className="w-full md:w-auto bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                    Add New Income
                </button>
            </div>
            <TransactionTable 
                title="All Income" 
                data={incomeData} 
                columns={columns}
                renderActions={renderIncomeActions} 
            />
        </div>
    );
};

export default Income;
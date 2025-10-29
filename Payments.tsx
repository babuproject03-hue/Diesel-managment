import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionTable, { StatusPill } from '../components/TransactionTable';
import { useAppContext } from '../context/AppContext';
import type { Payment } from '../types';
import { SearchIcon } from '../components/Icons';

type PaymentWithId = Payment & { id: string };

const Payments: React.FC = () => {
    const { payments: paymentData } = useAppContext();
    const navigate = useNavigate();

    const handleAddNewPayment = () => {
        navigate('/payments/new');
    };

    const columns = [
        { header: 'Payment ID', accessor: (item: PaymentWithId) => <span className="font-medium text-slate-800">{item.payment_id}</span> },
        { header: 'Related TXN', accessor: (item: PaymentWithId) => item.related_txn },
        { header: 'Date and Time', accessor: (item: PaymentWithId) => new Date(item.date).toLocaleString() },
        { header: 'Method', accessor: (item: PaymentWithId) => item.method },
        { header: 'Amount', accessor: (item: PaymentWithId) => `₹${item.amount.toLocaleString()}`, className: 'font-medium text-slate-900 text-right' },
        { header: 'Status', accessor: (item: PaymentWithId) => <StatusPill status={item.status} /> },
    ];
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="relative w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search by Payment ID, TXN..."
                        className="pl-10 pr-4 py-2 border rounded-md w-full md:w-80"
                    />
                </div>
                <button onClick={handleAddNewPayment} className="w-full md:w-auto bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                    Add New Payment
                </button>
            </div>
            <TransactionTable 
                title="All Payments" 
                data={paymentData} 
                columns={columns} 
                showActions={false}
            />
        </div>
    );
};

export default Payments;
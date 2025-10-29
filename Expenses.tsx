import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionTable from '../components/TransactionTable';
import { DUMMY_EXPENSE_DATA, DUMMY_EXPENSE_PARTIES, DUMMY_EXPENSE_VEHICLES } from '../constants';
import type { Expense } from '../types';
import { SearchIcon } from '../components/Icons';

const Expenses: React.FC = () => {
    const navigate = useNavigate();
    const [expensesData, setExpensesData] = useState<Expense[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [partyFilter, setPartyFilter] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    useEffect(() => {
        setExpensesData(DUMMY_EXPENSE_DATA);
    }, []);

    const handleAddNewExpense = () => {
        navigate('/expenses/new');
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setPartyFilter('');
        setVehicleFilter('');
        setDateFromFilter('');
        setDateToFilter('');
    };

    const filteredData = useMemo(() => {
        return expensesData.filter(expense => {
            const matchesSearch = (
                expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.dc_no.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const matchesParty = partyFilter ? expense.party === partyFilter : true;
            const matchesVehicle = vehicleFilter ? expense.vehicle === vehicleFilter : true;

            const expenseDate = new Date(expense.date);
            const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
            const toDate = dateToFilter ? new Date(dateToFilter) : null;

            if (fromDate) fromDate.setUTCHours(0, 0, 0, 0);
            if (toDate) toDate.setUTCHours(23, 59, 59, 999);

            const matchesDate = 
                (!fromDate || expenseDate >= fromDate) &&
                (!toDate || expenseDate <= toDate);

            return matchesSearch && matchesParty && matchesVehicle && matchesDate;
        });
    }, [searchQuery, partyFilter, vehicleFilter, dateFromFilter, dateToFilter, expensesData]);

    const columns = [
        { header: 'DC No.', accessor: (item: Expense) => <span className="font-medium text-slate-800">{item.dc_no}</span> },
        { header: 'Date', accessor: (item: Expense) => new Date(item.date).toLocaleDateString() },
        { header: 'Category', accessor: (item: Expense) => item.category },
        { header: 'Party', accessor: (item: Expense) => item.party },
        { header: 'Vehicle', accessor: (item: Expense) => item.vehicle },
        { header: 'Liters', accessor: (item: Expense) => item.liters && item.liters > 0 ? item.liters.toFixed(2) : 'N/A', className: 'text-right' },
        { header: 'Filler', accessor: (item: Expense) => item.fillerName || 'N/A' },
        { header: 'Amount', accessor: (item: Expense) => `₹${item.amount.toLocaleString()}`, className: 'font-medium text-slate-900 text-right' },
    ];
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-auto flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by category, party, DC No..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-md w-full"
                        />
                    </div>
                    <button onClick={handleAddNewExpense} className="w-full md:w-auto bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex-shrink-0">
                        Add New Expense
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:items-center gap-4">
                    <select value={partyFilter} onChange={e => setPartyFilter(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full">
                        <option value="">All Parties</option>
                        {DUMMY_EXPENSE_PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full">
                        <option value="">All Vehicles</option>
                        {DUMMY_EXPENSE_VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <input type="date" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full" />
                    <input type="date" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full" />
                    <button onClick={handleClearFilters} className="text-sm text-diesel-blue hover:underline col-span-2 md:col-span-4 lg:col-auto">Clear Filters</button>
                </div>
            </div>
            <TransactionTable title="All Expenses" data={filteredData} columns={columns} />
        </div>
    );
};

export default Expenses;
import React, { useState, useMemo } from 'react';
import TransactionTable, { StatusPill } from '../components/TransactionTable';
import { useAppContext } from '../context/AppContext';
import { DUMMY_EXPENSE_PARTIES, DUMMY_EXPENSE_VEHICLES } from '../constants';
import type { Income, Expense, Payment } from '../types';
import KPICard from '../components/KPICard';
import { DollarSignIcon } from '../components/Icons';

/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param filename The desired filename for the downloaded CSV file.
 * @param rows An array of objects to be converted to CSV.
 */
function exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
        alert('No data to export.');
        return;
    }

    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = String(cell);
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}


type PaymentWithId = Payment & { id: string };
type ReportType = 'income' | 'expenses' | 'payment';

const Reports: React.FC = () => {
    const [reportType, setReportType] = useState<ReportType>('income');

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [partyFilter, setPartyFilter] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('');
    
    // Data states
    const { 
        income: allIncome, 
        expenses: allExpenses, 
        payments: allPayments 
    } = useAppContext();
    
    const handleClearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setPartyFilter('');
        setVehicleFilter('');
    };
    
    // Memoized filtered data
    const filteredIncome = useMemo(() => {
        return allIncome.filter(item => {
            const itemDate = new Date(item.date);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from) from.setUTCHours(0,0,0,0);
            if (to) to.setUTCHours(23,59,59,999);
            
            return (!from || itemDate >= from) && (!to || itemDate <= to);
        });
    }, [allIncome, dateFrom, dateTo]);

    const enrichedIncomeData = useMemo(() => {
        return filteredIncome.map(incomeItem => {
            const paidAmount = allPayments
                .filter(p => p.related_txn === incomeItem.id)
                .reduce((sum, p) => sum + p.amount, 0);
            
            const balanceAmount = incomeItem.amount - paidAmount;

            let derivedStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
            if (balanceAmount <= 0) {
                derivedStatus = 'Paid';
            } else if (balanceAmount < incomeItem.amount) {
                derivedStatus = 'Partial';
            }

            return {
                ...incomeItem,
                paidAmount,
                balanceAmount,
                derivedStatus,
            };
        });
    }, [filteredIncome, allPayments]);

    const incomeReportTotals = useMemo(() => {
        const overallIncome = enrichedIncomeData.reduce((sum, i) => sum + i.amount, 0);
        const totalPaid = enrichedIncomeData.reduce((sum, i) => sum + i.paidAmount, 0);
        const balance = overallIncome - totalPaid;
        return { overallIncome, totalPaid, balance };
    }, [enrichedIncomeData]);

    const filteredExpenses = useMemo(() => {
        return allExpenses.filter(item => {
            const itemDate = new Date(item.date);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from) from.setUTCHours(0,0,0,0);
            if (to) to.setUTCHours(23,59,59,999);

            const matchesDate = (!from || itemDate >= from) && (!to || itemDate <= to);
            const matchesParty = !partyFilter || item.party === partyFilter;
            const matchesVehicle = !vehicleFilter || item.vehicle === vehicleFilter;

            return matchesDate && matchesParty && matchesVehicle;
        });
    }, [allExpenses, dateFrom, dateTo, partyFilter, vehicleFilter]);

    const filteredPayments = useMemo(() => {
        return allPayments.filter(item => {
            const itemDate = new Date(item.date);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from) from.setUTCHours(0,0,0,0);
            if (to) to.setUTCHours(23,59,59,999);
            
            return (!from || itemDate >= from) && (!to || itemDate <= to);
        });
    }, [allPayments, dateFrom, dateTo]);

    const handleExport = () => {
        const date = new Date().toISOString().split('T')[0];
        let dataToExport: any[] = [];
        let filename = '';

        switch(reportType) {
            case 'income':
                dataToExport = enrichedIncomeData.map(item => ({
                    Reference: item.reference,
                    Date: new Date(item.date).toLocaleDateString(),
                    Customer: item.customer,
                    'Total Amount (₹)': item.amount,
                    'Paid Amount (₹)': item.paidAmount,
                    'Balance Amount (₹)': item.balanceAmount,
                    'Payment Status': item.derivedStatus,
                }));
                filename = `income_report_${date}.csv`;
                break;
            case 'expenses':
                dataToExport = filteredExpenses.map(item => ({
                    'DC No': item.dc_no,
                    Date: new Date(item.date).toLocaleDateString(),
                    Category: item.category,
                    Party: item.party,
                    Vehicle: item.vehicle,
                    'Amount (₹)': item.amount,
                    Liters: item.liters || 0,
                    'Filler Name': item.fillerName || 'N/A',
                    Notes: item.notes,
                }));
                filename = `expenses_report_${date}.csv`;
                break;
            case 'payment':
                 dataToExport = filteredPayments.map(item => ({
                    'Payment ID': item.payment_id,
                    'Related TXN': item.related_txn,
                    Date: new Date(item.date).toLocaleDateString(),
                    Method: item.method,
                    'Amount (₹)': item.amount,
                    Status: item.status,
                }));
                filename = `payments_report_${date}.csv`;
                break;
        }

        exportToCsv(filename, dataToExport);
    };

    const incomeReportColumns = [
        { header: 'Reference', accessor: (item: any) => <span className="font-medium text-slate-800">{item.reference}</span> },
        { header: 'Date', accessor: (item: any) => new Date(item.date).toLocaleDateString() },
        { header: 'Customer', accessor: (item: any) => item.customer },
        { header: 'Total Amount', accessor: (item: any) => `₹${item.amount.toLocaleString()}`, className: 'text-right' },
        { header: 'Paid Amount', accessor: (item: any) => `₹${item.paidAmount.toLocaleString()}`, className: 'text-right' },
        { header: 'Balance Amount', accessor: (item: any) => `₹${item.balanceAmount.toLocaleString()}`, className: 'font-bold text-slate-900 text-right' },
        { header: 'Status', accessor: (item: any) => <StatusPill status={item.derivedStatus} /> },
    ];
    
    const expenseColumns = [
        { header: 'DC No.', accessor: (item: Expense) => <span className="font-medium text-slate-800">{item.dc_no}</span> },
        { header: 'Date', accessor: (item: Expense) => new Date(item.date).toLocaleDateString() },
        { header: 'Category', accessor: (item: Expense) => item.category },
        { header: 'Party', accessor: (item: Expense) => item.party },
        { header: 'Vehicle', accessor: (item: Expense) => item.vehicle },
        { header: 'Amount', accessor: (item: Expense) => `₹${item.amount.toLocaleString()}`, className: 'font-medium text-slate-900 text-right' },
    ];
    
    const paymentColumns = [
        { header: 'Payment ID', accessor: (item: PaymentWithId) => <span className="font-medium text-slate-800">{item.payment_id}</span> },
        { header: 'Related TXN', accessor: (item: PaymentWithId) => item.related_txn },
        { header: 'Date', accessor: (item: PaymentWithId) => new Date(item.date).toLocaleDateString() },
        { header: 'Method', accessor: (item: PaymentWithId) => item.method },
        { header: 'Amount', accessor: (item: PaymentWithId) => `₹${item.amount.toLocaleString()}`, className: 'font-medium text-slate-900 text-right' },
        { header: 'Status', accessor: (item: PaymentWithId) => <StatusPill status={item.status} /> },
    ];

    const renderFilters = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="dateFrom" className="text-sm font-medium text-slate-600">From Date</label>
                    <input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full mt-1" />
                </div>
                <div>
                    <label htmlFor="dateTo" className="text-sm font-medium text-slate-600">To Date</label>
                    <input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full mt-1" />
                </div>
                
                {reportType === 'expenses' && (
                    <>
                        <div>
                            <label htmlFor="partyFilter" className="text-sm font-medium text-slate-600">Party</label>
                             <select id="partyFilter" value={partyFilter} onChange={e => setPartyFilter(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full mt-1">
                                <option value="">All Parties</option>
                                {DUMMY_EXPENSE_PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vehicleFilter" className="text-sm font-medium text-slate-600">Vehicle</label>
                            <select id="vehicleFilter" value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} className="border rounded-md px-2 py-2 text-sm w-full mt-1">
                                <option value="">All Vehicles</option>
                                {DUMMY_EXPENSE_VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </>
                )}
                 <div className="col-span-full flex justify-end">
                    <button onClick={handleClearFilters} className="text-sm text-diesel-blue hover:underline">Clear Filters</button>
                </div>
            </div>
        )
    };
    
    const renderReport = () => {
        switch(reportType) {
            case 'income':
                const { overallIncome, totalPaid, balance } = incomeReportTotals;
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <KPICard title="Overall Income" value={`₹${overallIncome.toLocaleString()}`} icon={<DollarSignIcon />} />
                            <KPICard title="Payment Paid" value={`₹${totalPaid.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>} />
                            <KPICard title="Balance Payment" value={`₹${balance.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>} />
                        </div>
                        <TransactionTable title="Income Report" data={enrichedIncomeData} columns={incomeReportColumns} showActions={false} />
                    </div>
                );
            case 'expenses':
                return <TransactionTable title="Expenses Report" data={filteredExpenses} columns={expenseColumns} showActions={false} />;
            case 'payment':
                return <TransactionTable title="Payments Report" data={filteredPayments} columns={paymentColumns} showActions={false} />;
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-diesel-blue">Reports</h2>
                    <button onClick={handleExport} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                        Export as CSV
                    </button>
                </div>
                <div className="flex items-center space-x-4 border-b pb-4">
                    <span className="font-medium text-slate-700">Select Report:</span>
                    <div className="flex items-center gap-4">
                        {(['income', 'expenses', 'payment'] as ReportType[]).map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="reportType"
                                    value={type}
                                    checked={reportType === type}
                                    onChange={() => setReportType(type)}
                                    className="h-4 w-4 text-fuel-orange focus:ring-fuel-orange border-slate-300"
                                />
                                <span className="capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {renderFilters()}
            </div>
            {renderReport()}
        </div>
    );
};

export default Reports;
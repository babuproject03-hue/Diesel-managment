import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { Payment } from '../types';

// Re-using input components from other forms
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; }> = ({ label, id, className, ...rest }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <input
            id={id}
            name={id}
            {...rest}
            className={`mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm ${rest.readOnly ? 'bg-slate-100 cursor-not-allowed' : ''} ${className || ''}`}
        />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, id: string, children: React.ReactNode }> = ({ label, id, children, ...rest }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <select
            id={id}
            name={id}
            {...rest}
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm"
        >
            {children}
        </select>
    </div>
);

const NewPayment: React.FC = () => {
    const navigate = useNavigate();
    const { income, payments, addPayment } = useAppContext();

    const [selectedIncomeId, setSelectedIncomeId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [amountDue, setAmountDue] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    // Filter income records to show only those with outstanding balances
    const unpaidInvoices = useMemo(() => {
        return income.filter(i => i.payment_status === 'Unpaid' || i.payment_status === 'Partial');
    }, [income]);

    useEffect(() => {
        if (selectedIncomeId) {
            const selectedInvoice = income.find(i => i.id === selectedIncomeId);
            if (selectedInvoice) {
                setCustomerName(selectedInvoice.customer);
                setTotalAmount(selectedInvoice.amount);

                const paidAmount = payments
                    .filter(p => p.related_txn === selectedIncomeId)
                    .reduce((sum, p) => sum + p.amount, 0);
                
                setAmountDue(selectedInvoice.amount - paidAmount);
            }
        } else {
            setCustomerName('');
            setTotalAmount(0);
            setAmountDue(0);
        }
    }, [selectedIncomeId, income, payments]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const paymentAmount = parseFloat(formData.get('payment_amount') as string);
        
        if (!selectedIncomeId) {
            alert('Please select a Bill No.');
            return;
        }
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }
        
        const newPayment: Omit<Payment, 'payment_id'> = {
            related_txn: selectedIncomeId,
            date: new Date(formData.get('datetime') as string).toISOString(),
            method: formData.get('payment_mode') as string,
            amount: paymentAmount,
            status: 'Confirmed', // Default to confirmed for this simple form
        };
        
        addPayment(newPayment);
        alert('New payment record saved successfully!');
        navigate('/payments');
    };
    
    const handleCancel = () => {
        navigate('/payments');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-diesel-blue">Add New Payment</h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField 
                            label="Bill No." 
                            id="bill_no" 
                            name="bill_no" 
                            value={selectedIncomeId}
                            onChange={(e) => setSelectedIncomeId(e.target.value)}
                            required
                        >
                            <option value="">Select an Unpaid Bill</option>
                            {unpaidInvoices.map(inv => (
                                <option key={inv.id} value={inv.id}>
                                    {inv.reference} - {inv.customer} (₹{inv.amount.toLocaleString()})
                                </option>
                            ))}
                        </SelectField>
                        <InputField label="Date and Time" id="datetime" name="datetime" type="datetime-local" required />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Invoice Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-slate-500">Customer</p>
                                <p className="font-bold text-slate-800">{customerName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-500">Total Amount</p>
                                <p className="font-bold text-slate-800">₹{totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="font-medium text-slate-500">Amount Due</p>
                                <p className="font-bold text-red-600">₹{amountDue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label="Payment Amount (₹)" 
                            id="payment_amount" 
                            name="payment_amount"
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            required 
                            max={amountDue > 0 ? amountDue : undefined}
                         />
                         <SelectField label="Payment Mode" id="payment_mode" name="payment_mode" required>
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </SelectField>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button type="button" onClick={handleCancel} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-md hover:bg-slate-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                            Save Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewPayment;
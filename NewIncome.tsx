import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUMMY_CUSTOMERS, DUMMY_TANKS } from '../constants';
import type { Income } from '../types';
import { useAppContext } from '../context/AppContext';

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


const NewIncome: React.FC = () => {
    const navigate = useNavigate();
    const { income, addIncome } = useAppContext();
    const [liters, setLiters] = useState('');
    const [rate, setRate] = useState('');
    const [totalAmount, setTotalAmount] = useState('0.00');
    const [newBillNo, setNewBillNo] = useState('');
    const [newId, setNewId] = useState('');

    useEffect(() => {
        if (!income || income.length === 0) {
            setNewBillNo('INV-2025-1001');
            setNewId('inc_1001');
            return;
        }
        
        const lastNum = Math.max(...income.map(i => {
            const numPart = i.reference.split('-')[2];
            return numPart ? parseInt(numPart, 10) : 0;
        }));
        
        const lastIdNum = Math.max(...income.map(i => {
            const idPart = i.id.split('_')[1];
            return idPart ? parseInt(idPart, 10) : 0;
        }));

        if (isNaN(lastNum) || lastNum === 0) {
             setNewBillNo('INV-2025-1001');
        } else {
             const newNum = lastNum + 1;
             const yearPart = income[0]?.reference.split('-')[1] || new Date().getFullYear();
             setNewBillNo(`INV-${yearPart}-${newNum}`);
        }

        if (isNaN(lastIdNum) || lastIdNum === 0) {
            setNewId('inc_1001');
        } else {
            const newIdNum = lastIdNum + 1;
            setNewId(`inc_${newIdNum}`);
        }
    }, [income]);

    useEffect(() => {
        const numLiters = parseFloat(liters);
        const numRate = parseFloat(rate);

        if (!isNaN(numLiters) && numLiters > 0 && !isNaN(numRate) && numRate > 0) {
            setTotalAmount((numLiters * numRate).toFixed(2));
        } else {
            setTotalAmount('0.00');
        }
    }, [liters, rate]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newIncome: Income = {
            id: newId,
            reference: formData.get('bill_no') as string,
            date: new Date(formData.get('datetime') as string).toISOString().split('T')[0],
            customer: formData.get('customer_name') as string,
            vehicle: 'N/A',
            tank: formData.get('tank') as string,
            liters: parseFloat(formData.get('liters') as string),
            rate_per_liter: parseFloat(formData.get('rate') as string),
            amount: parseFloat(formData.get('total_amount') as string),
            payment_status: formData.get('payment_status') as 'Paid' | 'Partial' | 'Unpaid',
        };
        
        addIncome(newIncome);
        alert('New income record saved successfully!');
        navigate('/income');
    };
    
    const handleCancel = () => {
        navigate('/income');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-diesel-blue">Add New Income</h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Bill No / Invoice" id="bill_no" name="bill_no" type="text" value={newBillNo} readOnly />
                        <InputField label="Date and Time" id="datetime" name="datetime" type="datetime-local" required />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <SelectField label="Customer Name" id="customer_name" name="customer_name" required>
                            <option value="">Select a Customer</option>
                            {DUMMY_CUSTOMERS.map(customer => <option key={customer} value={customer}>{customer}</option>)}
                        </SelectField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <SelectField label="Tank" id="tank" name="tank" required>
                            <option value="">Select a Tank</option>
                            {DUMMY_TANKS.map(tank => <option key={tank} value={tank}>{tank}</option>)}
                        </SelectField>
                        <SelectField label="Payment Status" id="payment_status" name="payment_status" defaultValue="Paid" required>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                        </SelectField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <InputField 
                            label="Liters" 
                            id="liters" 
                            name="liters"
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            required 
                            value={liters}
                            onChange={(e) => setLiters(e.target.value)}
                         />
                         <InputField 
                            label="Rate per Liter (₹)" 
                            id="rate" 
                            name="rate"
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            required 
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                         />
                         <InputField 
                            label="Total Amount (₹)" 
                            id="total_amount" 
                            name="total_amount"
                            type="text" 
                            value={totalAmount} 
                            readOnly 
                         />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button type="button" onClick={handleCancel} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-md hover:bg-slate-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                            Save Income
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewIncome;
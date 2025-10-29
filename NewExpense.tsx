import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUMMY_EXPENSE_DATA, DUMMY_PARTIES, DUMMY_VEHICLES } from '../constants';
import type { Expense } from '../types';

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

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, id: string }> = ({ label, id, ...rest }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <textarea
            id={id}
            name={id}
            rows={3}
            {...rest}
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm"
        />
    </div>
);

const NewExpense: React.FC = () => {
    const navigate = useNavigate();
    const [newDcNo, setNewDcNo] = useState('');

    useEffect(() => {
        const expenses = DUMMY_EXPENSE_DATA;
        if (!expenses || expenses.length === 0) {
            setNewDcNo('DC-2025-2001');
            return;
        }
        
        const lastNum = Math.max(...expenses.map(e => {
            const numPart = e.dc_no.split('-')[2];
            return numPart ? parseInt(numPart, 10) : 0;
        }));

        if (isNaN(lastNum) || lastNum === 0) {
             setNewDcNo('DC-2025-2001');
             return;
        }

        const newNum = lastNum + 1;
        const yearPart = expenses[0]?.dc_no.split('-')[1] || new Date().getFullYear();

        setNewDcNo(`DC-${yearPart}-${newNum}`);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newExpense: Omit<Expense, 'id' | 'attachment_url'> = {
            dc_no: formData.get('dc_no') as string,
            date: new Date(formData.get('datetime') as string).toISOString(),
            party: formData.get('party_name') as string,
            vehicle: formData.get('vehicle_no') as string,
            category: 'Fuel Expense',
            amount: 0, // Amount is removed from the form, defaulting to 0
            liters: parseFloat(formData.get('diesel_liters') as string) || undefined,
            fillerName: formData.get('filler_name') as string || undefined,
            notes: formData.get('notes') as string,
        };

        console.log('New expense data (not saved):', newExpense);
        alert('Expense form submitted (data not saved).');
        navigate('/expenses');
    };
    
    const handleCancel = () => {
        navigate('/expenses');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-diesel-blue">Add New Expense</h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="DC No." id="dc_no" name="dc_no" type="text" value={newDcNo} readOnly />
                        <InputField label="Date and Time" id="datetime" name="datetime" type="datetime-local" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Party Name" id="party_name" name="party_name" required>
                            <option value="">Select a Party</option>
                            {DUMMY_PARTIES.map(party => <option key={party} value={party}>{party}</option>)}
                        </SelectField>
                         <SelectField label="Vehicle No." id="vehicle_no" name="vehicle_no" required>
                            <option value="">Select a Vehicle</option>
                             <option value="N/A">N/A</option>
                            {DUMMY_VEHICLES.map(vehicle => <option key={vehicle} value={vehicle}>{vehicle}</option>)}
                        </SelectField>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <InputField 
                            label="Diesel Liters" 
                            id="diesel_liters" 
                            name="diesel_liters"
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                         />
                         <InputField 
                            label="Filler Name" 
                            id="filler_name" 
                            name="filler_name" 
                            type="text" 
                            placeholder="Enter filler's name" 
                        />
                    </div>
                    
                    <TextAreaField label="Notes / Remark" id="notes" name="notes" placeholder="Add any relevant notes here..." />

                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button type="button" onClick={handleCancel} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-md hover:bg-slate-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                            Save Expense
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewExpense;
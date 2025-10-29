import React from 'react';

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; }> = ({ label, id, className, ...rest }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <input
            id={id}
            name={id}
            {...rest}
            className={`mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm ${className || ''}`}
        />
    </div>
);

const SelectField: React.FC<{ label: string, id: string, children: React.ReactNode }> = ({ label, id, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <select
            id={id}
            name={id}
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm"
        >
            {children}
        </select>
    </div>
);

const TextAreaField: React.FC<{ label: string, id: string, rows?: number, placeholder?: string }> = ({ label, id, rows = 3, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <textarea
            id={id}
            name={id}
            rows={rows}
            placeholder={placeholder}
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-diesel-blue focus:border-diesel-blue sm:text-sm"
            required
        />
    </div>
);


const StockAdjustmentForm: React.FC<{ onSave: () => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Stock Adjustment Form submitted");
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField label="Tank / Product" id="tank">
                    <option>Tank A (Diesel)</option>
                    <option>Tank B (Diesel)</option>
                    <option>Tank C (Premium Diesel)</option>
                </SelectField>
                <SelectField label="Adjustment Type" id="adjustment_type">
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                </SelectField>
            </div>

            <InputField 
                label="Liters" 
                type="number" 
                id="liters" 
                required 
                placeholder="0.00"
                step="0.01"
            />
            
            <TextAreaField 
                label="Reason" 
                id="reason" 
                placeholder="e.g., Manual correction, damage, or delivery" 
            />

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-md hover:bg-slate-300 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                    Save Adjustment
                </button>
            </div>
        </form>
    );
};

export default StockAdjustmentForm;
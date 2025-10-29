
import React from 'react';

const Settings: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-diesel-blue">Settings</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Company Details</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Company Name</label>
                        <input type="text" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" defaultValue="My Fuel Station" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Currency</label>
                        <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm">
                            <option>INR (₹)</option>
                            <option>USD ($)</option>
                        </select>
                    </div>
                     <div className="text-right">
                        <button type="submit" className="bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">User Management</h2>
                <p className="text-slate-500">User management interface will be here.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Categories & Tanks</h2>
                <p className="text-slate-500">Management for expense/income categories, vehicles, and tanks will be here.</p>
            </div>
        </div>
    );
};

export default Settings;

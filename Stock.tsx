import React, { useState, useEffect } from 'react';
import StockCard from '../components/StockCard';
import { DUMMY_STOCK_DATA } from '../constants';
import type { Stock as StockType } from '../types';
import Modal from '../components/Modal';
import StockAdjustmentForm from '../components/StockAdjustmentForm';

const Stock: React.FC = () => {
    const [stockData, setStockData] = useState<StockType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setStockData(DUMMY_STOCK_DATA);
    }, []);

    const handleAdjustStock = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveAdjustment = () => {
        // In a real app, you would handle the form data submission
        console.log('Stock adjustment saved!');
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <h2 className="text-xl font-bold text-diesel-blue">Stock Overview</h2>
                <button 
                    onClick={handleAdjustStock}
                    className="bg-fuel-orange text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                >
                    Adjust Stock
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stockData.map(stock => (
                    <StockCard key={stock.tank_id} stock={stock} />
                ))}
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Stock History / Audit Trail</h3>
                <p className="text-slate-500">Stock history and audit trail will be displayed here.</p>
             </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Stock Adjustment">
                <StockAdjustmentForm onSave={handleSaveAdjustment} onCancel={handleCloseModal} />
            </Modal>
        </div>
    );
};

export default Stock;
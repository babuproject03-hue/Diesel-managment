import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Income, Expense, Stock, Payment } from '../types';
import { DUMMY_INCOME_DATA, DUMMY_EXPENSE_DATA, DUMMY_STOCK_DATA, DUMMY_PAYMENT_DATA } from '../constants';

type PaymentWithId = Payment & { id: string };

interface AppContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  income: Income[];
  expenses: Expense[];
  stock: Stock[];
  payments: PaymentWithId[];
  addIncome: (newIncome: Income) => void;
  addPayment: (newPaymentData: Omit<Payment, 'payment_id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data state
  const [income, setIncome] = useState<Income[]>(DUMMY_INCOME_DATA);
  const [expenses, setExpenses] = useState<Expense[]>(DUMMY_EXPENSE_DATA);
  const [stock, setStock] = useState<Stock[]>(DUMMY_STOCK_DATA);
  const [payments, setPayments] = useState<PaymentWithId[]>(DUMMY_PAYMENT_DATA.map(p => ({ ...p, id: p.payment_id })));

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const addIncome = (newIncome: Income) => {
    setIncome(prevIncome => [newIncome, ...prevIncome]);
  };

  const addPayment = (newPaymentData: Omit<Payment, 'payment_id'>) => {
    // 1. Generate new payment ID
    const lastIdNum = Math.max(...payments.map(p => {
        const idPart = p.payment_id.split('_')[1];
        return idPart ? parseInt(idPart, 10) : 0;
    }));
    const newIdNum = (isNaN(lastIdNum) || lastIdNum === 0) ? 3001 : lastIdNum + 1;
    const newPaymentId = `pay_${newIdNum}`;

    const newPayment: PaymentWithId = {
        ...newPaymentData,
        payment_id: newPaymentId,
        id: newPaymentId,
    };

    // 2. Add new payment to the list
    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);

    // 3. Update the related income record's status
    const relatedIncome = income.find(i => i.id === newPayment.related_txn);
    if (relatedIncome) {
        const paymentsForThisIncome = updatedPayments.filter(p => p.related_txn === relatedIncome.id);
        const totalPaid = paymentsForThisIncome.reduce((sum, p) => sum + p.amount, 0);

        let newStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
        if (totalPaid >= relatedIncome.amount) {
            newStatus = 'Paid';
        } else if (totalPaid > 0) {
            newStatus = 'Partial';
        }

        const updatedIncome = income.map(i => 
            i.id === relatedIncome.id 
            ? { ...i, payment_status: newStatus } 
            : i
        );
        setIncome(updatedIncome);
    }
  };

  return (
    <AppContext.Provider value={{ 
      isSidebarOpen, toggleSidebar, setSidebarOpen, isAuthenticated, login, logout,
      income, expenses, stock, payments, addIncome, addPayment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
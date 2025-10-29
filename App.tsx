import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Stock from './pages/Stock';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NewExpense from './pages/NewExpense';
import NewIncome from './pages/NewIncome';
import NewPayment from './pages/NewPayment';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// A placeholder for pages that are not yet implemented
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-diesel-blue">{title}</h1>
        <p className="mt-4 text-slate-600">This page is under construction.</p>
    </div>
);


const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/income/new" element={<NewIncome />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/expenses/new" element={<NewExpense />} />
                    <Route path="/stock" element={<Stock />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/payments/new" element={<NewPayment />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/audit" element={<PlaceholderPage title="Audit / Logs" />} />
                    <Route path="/help" element={<PlaceholderPage title="Help / Docs" />} />
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;


import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { HomeIcon, DollarSignIcon, FuelIcon, CreditCardIcon, BarChartIcon, SettingsIcon } from './Icons';

const navigationLinks = [
  { to: '/', label: 'Dashboard', icon: <HomeIcon /> },
  { to: '/income', label: 'Income', icon: <DollarSignIcon /> },
  { to: '/expenses', label: 'Expenses', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m16 8-8 8"/><path d="m8 8 8 8"/></svg> },
  { to: '/stock', label: 'Stock', icon: <FuelIcon /> },
  { to: '/payments', label: 'Payments', icon: <CreditCardIcon /> },
  { to: '/reports', label: 'Reports', icon: <BarChartIcon /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

const SideNav: React.FC = () => {
  const { isSidebarOpen } = useAppContext();

  return (
    <aside className={`fixed top-0 left-0 h-full bg-diesel-blue text-white transition-all duration-300 ease-in-out z-40 ${isSidebarOpen ? 'w-64' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
      <div className="p-6 flex items-center gap-3 overflow-hidden">
        <FuelIcon />
        <h1 className={`text-xl font-bold font-poppins whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto' : 'w-0'}`}>Diesel Mgmt</h1>
      </div>
      <nav className="mt-8">
        <ul>
          {navigationLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                title={!isSidebarOpen ? link.label : ''}
                className={({ isActive }) => 
                  `flex items-center py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 ${
                    isActive ? 'bg-fuel-orange text-white' : ''
                  } ${isSidebarOpen ? 'px-6' : 'lg:justify-center px-6'}`
                }
              >
                <div className="flex-shrink-0">
                  {link.icon}
                </div>
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-4 w-auto' : 'w-0'}`}>
                  {link.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideNav;
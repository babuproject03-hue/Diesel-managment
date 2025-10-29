import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BellIcon, ChevronDownIcon, MenuIcon } from './Icons';

const TopNav: React.FC = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { toggleSidebar, logout } = useAppContext();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname === '/' ? 'Dashboard' : location.pathname.split('/').filter(p => p)[0];
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleLogout = () => {
      logout();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="text-slate-600">
                <MenuIcon />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-slate-500 hover:text-slate-800">
            <BellIcon />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuel-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-fuel-orange"></span>
            </span>
          </button>

          <div className="relative">
            <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
              <img
                src={`https://picsum.photos/seed/user/40/40`}
                alt="User Avatar"
                className="h-9 w-9 rounded-full"
              />
              <span className="hidden md:inline font-medium text-slate-700">Admin User</span>
              <ChevronDownIcon />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a href="#profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Profile</a>
                <a href="#settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Settings</a>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
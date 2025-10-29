

import React, { ReactNode } from 'react';
import SideNav from './SideNav';
import TopNav from './TopNav';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen } = useAppContext();

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <SideNav />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <TopNav />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex min-vh-100 bg-app-light">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-grow-1 d-flex flex-column main-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>

        <footer className="bg-white border-top py-3 px-4 text-center text-muted small">
          <span>&copy; {new Date().getFullYear()} StaffSync — Modern Human Resource Management System. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

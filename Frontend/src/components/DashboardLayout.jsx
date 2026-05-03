import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-background text-on-surface font-body-md flex flex-col">
      <NavBar />
      <div className="flex-grow max-w-[1400px] mx-auto w-full px-2 md:px-4 py-10 flex flex-col md:flex-row gap-6">
        <DashboardSidebar />
        <main className="flex-grow min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

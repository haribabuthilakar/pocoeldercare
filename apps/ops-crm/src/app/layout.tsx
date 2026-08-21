'use client';

import './globals.css';
import React from 'react';
import { SidebarNav } from '../components/layout/sidebar-nav';
import { TopCommandBar } from '../components/layout/top-command-bar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Pococare Operations CRM & Mission Control Hub</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
        {/* Left Fixed Sidebar */}
        <SidebarNav />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopCommandBar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

'use client';

import React, { useState } from 'react';
import '@/app/globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>VESSEL-X | AIS Anomaly Intelligence Platform</title>
        <meta
          name="description"
          content="Commercial-grade AIS Vessel Behavior Analysis and Anomaly Detection Platform"
        />
      </head>
      <body className="bg-maritime text-slate-100 min-h-screen font-sans flex antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Workspace Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64 min-h-screen">
          <Topbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

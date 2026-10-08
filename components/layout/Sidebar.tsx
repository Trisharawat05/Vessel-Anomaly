'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ship,
  TriangleAlert,
  GitCompare,
  ChartNoAxesCombined,
  Database,
  Activity,
  Navigation,
  Radio,
  X,
} from 'lucide-react';
import { isMockMode } from '@/lib/api';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const mockMode = isMockMode();

  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Vessel Explorer', href: '/vessel-explorer', icon: Ship },
    { name: 'Anomaly Detection', href: '/anomaly-detection', icon: TriangleAlert },
    { name: 'Model Comparison', href: '/model-comparison', icon: GitCompare },
    { name: 'Analytics', href: '/analytics', icon: ChartNoAxesCombined },
    { name: 'Data Quality', href: '/data-quality', icon: Database },
    { name: 'System Status', href: '/system-status', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090e1c] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header & Minimal Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group" onClick={onCloseMobile}>
            {/* Minimal Logo: Vessel + Radar + Nav Symbol */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
              <span className="absolute inset-0 rounded-xl bg-cyan-500/10 animate-ping opacity-25" />
              <Ship className="w-5 h-5 text-cyan-400 relative z-10" />
              <Navigation className="w-3 h-3 text-teal-300 absolute -top-1 -right-1 z-20" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-extrabold tracking-wider text-base text-white">
                  VESSEL<span className="text-cyan-400">-X</span>
                </span>
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                AIS Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer — Status Indicators */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2 text-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            System Overview
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${mockMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span>API Status:</span>
            </span>
            <span className="font-mono text-[11px] text-slate-200">
              {mockMode ? 'Demo Mode' : 'Connected'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Model Status:</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-300">Ready</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Dataset:</span>
            </span>
            <span className="font-mono text-[11px] text-slate-200">358.3k Rows</span>
          </div>
        </div>
      </aside>
    </>
  );
};

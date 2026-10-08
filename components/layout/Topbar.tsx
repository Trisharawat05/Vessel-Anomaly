'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  Bell,
  User,
  Menu,
  Database,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { setMockModeOverride, isMockMode } from '@/lib/api';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const mockMode = isMockMode();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/vessel-explorer?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      router.refresh();
    }, 600);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by MMSI, vessel type, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/90 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
          />
        </form>
      </div>

      {/* Right: Data Range, Refresh, Notifications, Profile */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Data Range Selector */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/90 text-xs font-medium text-slate-300">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>358,351 Records</span>
          <span className="text-[10px] text-slate-500 font-mono">| AIS 2026</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          title="Refresh Data"
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/60"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/60 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200">Notifications</span>
                <span className="text-[10px] text-cyan-400 font-mono">3 New</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                  <div className="font-medium text-slate-200">Isolation Forest Completed</div>
                  <div className="text-[11px] text-slate-400">3,584 candidates flagged across 358k rows.</div>
                </div>
                <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                  <div className="font-medium text-slate-200">Shared Model Agreement</div>
                  <div className="text-[11px] text-slate-400">19 observations flagged by both methods.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User / Mode Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xs">
              VX
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-2 z-50 text-xs">
              <div className="p-2 border-b border-slate-800">
                <div className="font-semibold text-slate-200">Maritime Intelligence Analyst</div>
                <div className="text-[11px] text-slate-400">admin@vessel-x.ai</div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setMockModeOverride(!mockMode)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-300"
                >
                  <span>{mockMode ? 'Switch to Live API Mode' : 'Switch to Demo Data'}</span>
                  {mockMode && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

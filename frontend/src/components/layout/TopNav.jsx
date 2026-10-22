import React from 'react';
import { Bell, Search, Shield, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopNav = () => {
  const { user } = useAuth();

  // Helper to format role text
  const formatRole = (role) => {
    if (!role) return 'Admin';
    return role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-6 lg:px-8 shrink-0 transition-all">
      {/* Search Bar with Keyboard Shortcut */}
      <div className="flex items-center bg-slate-100/80 hover:bg-slate-100 rounded-xl px-3.5 py-2 w-72 sm:w-96 border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-xs">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input 
          type="text"
          placeholder="Search products, SKUs, warehouses..."
          className="bg-transparent border-none outline-none ml-2.5 w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium"
        />
        <kbd className="hidden sm:inline-flex items-center space-x-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
          <span>Ctrl</span>
          <span>K</span>
        </kbd>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Real-time Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Sync</span>
        </div>

        {/* Notifications */}
        <button 
          title="System Notifications"
          className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-95"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center space-x-3 pl-3 sm:pl-4 border-l border-slate-200/80">
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25 ring-2 ring-white group-hover:scale-105 transition-transform">
              {getInitials(user?.name)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-bold text-xs text-slate-800 leading-tight truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">{formatRole(user?.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;


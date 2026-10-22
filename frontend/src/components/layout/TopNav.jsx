import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, Search, Shield, Zap, Sparkles, User, Settings, 
  LogOut, ChevronDown, CheckCircle2, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-95 cursor-pointer"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile Container with Dropdown Menu */}
        <div className="relative pl-3 sm:pl-4 border-l border-slate-200/80" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            type="button"
            className="flex items-center space-x-3 text-left focus:outline-none p-1.5 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25 ring-2 ring-white group-hover:scale-105 transition-transform">
                {getInitials(user?.name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="hidden sm:block">
              <p className="font-bold text-xs text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                {formatRole(user?.role)}
              </p>
            </div>

            <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Modern Profile Dropdown Card */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 text-slate-800 z-50 animate-in">
              {/* User Overview Header */}
              <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-100 mb-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/25 shrink-0">
                    {getInitials(user?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@example.com'}</p>
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-blue-100/80 text-blue-700 text-[10px] font-bold uppercase tracking-wider mt-1">
                      <ShieldCheck size={10} />
                      <span>{formatRole(user?.role)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5 py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <User size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>View Profile & Account</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Security & Permissions</span>
                  </div>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="pt-1 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;



import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Truck, Warehouse, ArrowDownToLine, 
  ArrowUpFromLine, FileText, LogOut, ShieldCheck, Sparkles, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navigationSections = [
    {
      title: 'OVERVIEW',
      links: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Inventory', path: '/inventory', icon: Package },
      ]
    },
    {
      title: 'STOCK OPERATIONS',
      links: [
        { name: 'Stock IN', path: '/stock-in', icon: ArrowDownToLine, badge: 'Receive' },
        { name: 'Stock OUT', path: '/stock-out', icon: ArrowUpFromLine, badge: 'Dispatch' },
      ]
    },
    {
      title: 'LOGISTICS & AUDIT',
      links: [
        { name: 'Suppliers', path: '/suppliers', icon: Truck },
        { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
        { name: 'Reports & Audit', path: '/reports', icon: FileText },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800/80 shrink-0 select-none transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        {/* Brand Logo Header */}
        <div className="p-5 sm:p-6 pb-5 flex items-center justify-between border-b border-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10 shrink-0">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center">
                Smart<span className="text-blue-400">Inventory</span>
              </h2>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Enterprise v2.0</span>
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links Grouped by Section */}
        <nav className="flex-1 px-3.5 py-4 space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                {section.title}
              </p>
              <div className="space-y-1 pt-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={onClose}
                      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-white/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'} />
                        <span>{link.name}</span>
                      </div>
                      {link.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Current User Profile & Log Out */}
        <div className="p-3.5 border-t border-slate-900 space-y-2 bg-slate-950/60">
          <Link
            to="/profile"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 flex items-center justify-between group transition-all cursor-pointer shadow-xs"
            title="Open Profile & Settings"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center space-x-1">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{user?.role || 'ADMIN'}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded bg-slate-800/60 group-hover:bg-blue-500/10">
              Profile →
            </span>
          </Link>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

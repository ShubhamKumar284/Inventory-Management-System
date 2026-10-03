import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowRightLeft, Users, Settings, AlertTriangle, FileText, Truck, Warehouse, ArrowDownToLine, ArrowUpFromLine, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Stock IN', path: '/stock-in', icon: <ArrowDownToLine size={20} /> },
    { name: 'Stock OUT', path: '/stock-out', icon: <ArrowUpFromLine size={20} /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
    { name: 'Warehouses', path: '/warehouses', icon: <Warehouse size={20} /> },
    { name: 'Reports & Audit', path: '/reports', icon: <FileText size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-400">Smart<span className="text-white">Inventory</span></h2>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === link.path
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {link.icon}
            <span className="font-medium">{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

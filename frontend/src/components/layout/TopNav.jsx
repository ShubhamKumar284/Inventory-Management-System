import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const TopNav = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center bg-slate-100 rounded-lg px-4 py-2.5 w-[400px] border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text"
          placeholder="Search SKU, items, or references..."
          className="bg-transparent border-none outline-none ml-3 w-full text-sm text-slate-700 placeholder-slate-400"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 pl-6 border-l border-slate-200 cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
            AD
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500 font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

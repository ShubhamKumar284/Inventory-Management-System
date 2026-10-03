import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

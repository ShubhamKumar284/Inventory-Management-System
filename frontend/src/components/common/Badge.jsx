import React from 'react';

const Badge = ({ children, variant = 'slate' }) => {
  const variants = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant] || variants.slate}`}>
      {children}
    </span>
  );
};

export default Badge;

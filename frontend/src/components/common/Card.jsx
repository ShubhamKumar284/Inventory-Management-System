import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 transition-all duration-300 ${hover ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;

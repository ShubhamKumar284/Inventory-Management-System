import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No Data Found', description = 'There is currently no data to display.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-full w-full">
      <PackageOpen className="h-12 w-12 mb-3 opacity-30" strokeWidth={1.5} />
      <p className="text-base font-semibold text-slate-600">{title}</p>
      <p className="text-sm mt-1 text-center max-w-xs">{description}</p>
    </div>
  );
};

export default EmptyState;

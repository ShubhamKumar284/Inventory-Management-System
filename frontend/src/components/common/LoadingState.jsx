import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;

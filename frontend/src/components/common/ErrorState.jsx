import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong while fetching data.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-rose-600 bg-rose-50 rounded-2xl border border-rose-100">
      <AlertTriangle className="h-10 w-10 mb-4 text-rose-500" strokeWidth={1.5} />
      <p className="text-sm font-semibold mb-6 text-center">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;

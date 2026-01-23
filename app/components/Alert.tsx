import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  type?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Alert({ children, type = 'info', className = '' }: AlertProps) {
  const types = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  return (
    <div
      className={`border rounded-lg p-4 ${types[type]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}

import React from 'react';

const colorStyles = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  gray: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const chosenStyle = colorStyles[variant] || colorStyles.gray;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${chosenStyle} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let variant = 'gray';
  const s = String(status).toLowerCase();

  if (s === 'completed' || s === 'paid' || s === 'active' || s === 'confirmed') {
    variant = 'green';
  } else if (s === 'scheduled' || s === 'sample collected' || s === 'in testing') {
    variant = 'blue';
  } else if (s === 'partially paid' || s === 'urgent' || s === 'inpatient') {
    variant = 'amber';
  } else if (s === 'cancelled' || s === 'stat (emergency)' || s === 'unpaid' || s === 'no-show') {
    variant = 'red';
  } else if (s === 'requested') {
    variant = 'purple';
  }

  return <Badge variant={variant}>{status}</Badge>;
};

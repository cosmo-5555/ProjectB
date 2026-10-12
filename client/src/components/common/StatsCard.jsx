import React from 'react';

export const StatsCard = ({ title, value, subtext, icon: Icon, color = 'teal' }) => {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100',
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-200/70 shadow-sm hover:shadow-md transition">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3.5 rounded-2xl ${scheme.bg} ${scheme.text} ${scheme.border} border`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
    </div>
  );
};

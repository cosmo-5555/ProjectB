import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Clock, LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Chief Administrator';
      case 'doctor':
        return 'Physician / Specialist';
      case 'receptionist':
        return 'Front Desk Officer';
      case 'pharmacist':
        return 'Chief Pharmacist';
      case 'lab_staff':
        return 'Lab Technologist';
      case 'billing_staff':
        return 'Billing Officer';
      default:
        return 'Patient';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-6 backdrop-blur-md">
      {/* Left side: Mobile menu toggle + Live Clock */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
          <Clock className="h-3.5 w-3.5 text-teal-600" />
          <span>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}{' '}
            • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Right side: Notifications & User Profile */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* User Pill & Quick Logout */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-teal-100">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-semibold text-teal-600">{formatRoleLabel(user?.role)}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out securely"
            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

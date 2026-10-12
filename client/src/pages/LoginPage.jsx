import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Stethoscope, Users, Pill, FlaskConical, Receipt } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background radial gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 text-white shadow-xl shadow-teal-500/30">
            <Activity className="h-8 w-8 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Care<span className="text-teal-400">Pulse</span> HMS
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Enterprise Hospital Management System Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-center space-x-3 text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Hospital Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Picker */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Fast Demo Switcher (1-Click Login)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@hospital.com', 'Admin@123')}
                className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition group"
              >
                <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Admin</p>
                  <p className="text-[10px] text-slate-400">Chief Admin</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('doctor.sarah@hospital.com', 'Doctor@123')}
                className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-left transition group"
              >
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Doctor</p>
                  <p className="text-[10px] text-slate-400">Cardiology</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('reception@hospital.com', 'Staff@123')}
                className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition group"
              >
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Reception</p>
                  <p className="text-[10px] text-slate-400">Front Desk</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('pharmacist@hospital.com', 'Staff@123')}
                className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Pill className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Pharmacy</p>
                  <p className="text-[10px] text-slate-400">Dispensing</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('lab@hospital.com', 'Staff@123')}
                className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition group"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Lab Tech</p>
                  <p className="text-[10px] text-slate-400">Diagnostic</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('billing@hospital.com', 'Staff@123')}
                className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 text-left transition group"
              >
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Billing</p>
                  <p className="text-[10px] text-slate-400">Finance</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

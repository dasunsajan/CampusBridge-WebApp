import React from 'react';
import { Menu, Bell, Search, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl lg:hidden focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local SQLite Database Connected</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Currency: <strong>LKR (Rs.)</strong></span>
        </div>

        {/* Profile Avatar / Student Demonstrator Info */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            AS
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-slate-800">A.G.D.S. Sandeepa</p>
            <p className="text-slate-400 font-mono text-[11px]">EG/2023/5864</p>
          </div>
        </div>
      </div>
    </header>
  );
};

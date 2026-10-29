import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  HandCoins,
  BarChart3,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Campus Events', path: '/events', icon: CalendarDays },
    { label: 'Sponsors Directory', path: '/sponsors', icon: Building2 },
    { label: 'Sponsorship Pledges', path: '/sponsorships', icon: HandCoins },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center space-x-1.5">
                <span>CampusBridge</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-1.5 py-0.5 rounded border border-indigo-400/20">
                  LK
                </span>
              </span>
              <p className="text-[10px] text-slate-400">Events & Micro-Sponsorships</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sri Lankan Academic Mini-Project footer */}
        <div className="p-4 m-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-xs">
          <div className="flex items-center space-x-2 text-indigo-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EC4307 Mini Project</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Evaluation Prototype designed for university clubs and micro-sponsors.
          </p>
        </div>
      </aside>
    </>
  );
};

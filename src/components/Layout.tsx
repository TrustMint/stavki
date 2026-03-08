import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, PlusCircle, Search, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen p-6 border-r border-white/5 bg-black/20 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Trophy className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">PolyPredict</h1>
            <p className="text-xs text-zinc-400 font-medium tracking-wide">КИБЕРСПОРТ ТРЕКЕР</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <DesktopNavLink to="/" icon={<Home size={20} />} label="Главная" />
          <DesktopNavLink to="/add" icon={<PlusCircle size={20} />} label="Добавить прогноз" />
          <DesktopNavLink to="/search" icon={<Search size={20} />} label="История поиска" />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10 flex items-center justify-center">
              <User size={14} className="text-zinc-300" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">Аккаунт</p>
              <p className="text-xs text-zinc-400">Pro План</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 pb-32 md:p-8 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation (Floating Glass Pill) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <nav className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-full shadow-lg flex justify-around items-center p-2 w-full max-w-[320px] pointer-events-auto">
          <MobileNavLink to="/" icon={<Home size={24} />} label="Главная" />
          <NavLink 
            to="/add" 
            className={({ isActive }) => `
              relative -top-8
              flex items-center justify-center w-16 h-16 rounded-full 
              bg-emerald-600 text-white shadow-lg
              border-[6px] border-black transition-transform active:scale-95
              ${isActive ? 'scale-110' : ''}
            `}
          >
            <PlusCircle size={32} />
          </NavLink>
          <MobileNavLink to="/search" icon={<Search size={24} />} label="Поиск" />
        </nav>
      </div>
    </div>
  );
}

function DesktopNavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
        ${isActive 
          ? 'bg-white/10 text-white shadow-lg shadow-black/20 border border-white/5' 
          : 'text-zinc-400 hover:text-white hover:bg-white/5 hover:border hover:border-white/5 border border-transparent'}
      `}
    >
      <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

function MobileNavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-200
        ${isActive ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}
      `}
    >
      <motion.div whileTap={{ scale: 0.9 }}>
        {icon}
      </motion.div>
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </NavLink>
  );
}

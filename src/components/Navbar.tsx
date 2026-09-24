"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  StickyNote,
  Plus,
  LogOut,
  User as UserIcon,
  Coins,
  ChevronDown,
} from "lucide-react";
import { IUser } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface NavbarProps {
  user: IUser | null;
  activeTab: "overview" | "expenses" | "charts" | "notes";
  onTabChange: (tab: "overview" | "expenses" | "charts" | "notes") => void;
  onOpenNewExpense: () => void;
  onOpenNewNote: () => void;
  onLogout: () => Promise<void>;
}

const NAV_TABS = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "expenses" as const, label: "Expenses", icon: Receipt },
  { id: "charts" as const, label: "Analytics", icon: PieChart },
  { id: "notes" as const, label: "Notes", icon: StickyNote },
] as const;

export default function Navbar({
  user,
  activeTab,
  onTabChange,
  onOpenNewExpense,
  onOpenNewNote,
  onLogout,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currency, setIsCurrencyModalOpen } = useCurrency();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

  return (
    <>
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#080c14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              SpendTrack
            </span>
          </div>

          {/* Desktop Nav Pills */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/[0.06]">
              {NAV_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    activeTab === id
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Currency Badge */}
                <button
                  type="button"
                  onClick={() => setIsCurrencyModalOpen(true)}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 hover:border-amber-500/35 transition-all"
                  title="Change currency"
                >
                  <Coins className="w-3 h-3" />
                  <span>{currency}</span>
                </button>

                {/* Add Expense — prominent CTA */}
                <button
                  type="button"
                  onClick={onOpenNewExpense}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>

                {/* User Avatar Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center gap-1.5 h-8 px-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showUserMenu && (
                    <div className="animate-scale-in absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#111827] border border-white/[0.08] shadow-2xl z-50 overflow-hidden">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      {/* Note shortcut */}
                      <button
                        type="button"
                        onClick={() => { setShowUserMenu(false); onOpenNewNote(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/[0.06] transition text-left"
                      >
                        <StickyNote className="w-3.5 h-3.5 text-indigo-400" />
                        New Note
                      </button>

                      {/* Currency */}
                      <button
                        type="button"
                        onClick={() => { setShowUserMenu(false); setIsCurrencyModalOpen(true); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-300 hover:bg-white/[0.06] transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          Currency
                        </div>
                        <span className="font-mono font-bold text-amber-400 text-[11px]">{currency}</span>
                      </button>

                      <div className="border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={async () => { setShowUserMenu(false); await onLogout(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCurrencyModalOpen(true)}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition"
                >
                  <Coins className="w-3 h-3" />
                  {currency}
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation ── */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#080c14]/95 backdrop-blur-xl pb-safe">
          <div className="flex items-center justify-around px-2 pt-2 pb-1">
            {NAV_TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange(id)}
                  className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? "text-blue-400"
                      : "text-slate-500 hover:text-slate-300 active:text-white"
                  }`}
                >
                  <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? "bg-blue-500/15" : ""}`}>
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </div>
                  <span className={`text-xs font-medium leading-none ${isActive ? "text-blue-400 font-semibold" : ""}`}>
                    {label}
                  </span>
                </button>
              );
            })}

            {/* Quick Add FAB in bottom nav */}
            <button
              type="button"
              onClick={onOpenNewExpense}
              className="flex flex-col items-center gap-1 flex-1 py-1.5"
            >
              <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-400 leading-none">Add</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

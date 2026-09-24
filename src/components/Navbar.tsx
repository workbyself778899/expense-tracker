"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  StickyNote,
  Plus,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { IUser } from "@/types";

interface NavbarProps {
  user: IUser | null;
  activeTab: "overview" | "expenses" | "charts" | "notes";
  onTabChange: (tab: "overview" | "expenses" | "charts" | "notes") => void;
  onOpenNewExpense: () => void;
  onOpenNewNote: () => void;
  onLogout: () => Promise<void>;
}

export default function Navbar({
  user,
  activeTab,
  onTabChange,
  onOpenNewExpense,
  onOpenNewNote,
  onLogout,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Expense Tracker
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Personal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Secure Financial Hub & Rich Notes
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => onTabChange("overview")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("expenses")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === "expenses"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Transactions</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("charts")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === "charts"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("notes")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === "notes"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <StickyNote className="w-4 h-4" />
                <span>Notes & Draw</span>
              </button>
            </nav>
          )}

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Add Note Button */}
                <button
                  type="button"
                  onClick={onOpenNewNote}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 shadow transition"
                >
                  <StickyNote className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Note</span>
                </button>

                {/* Add Expense Button */}
                <button
                  type="button"
                  onClick={onOpenNewExpense}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>

                {/* User Menu Dropdown */}
                <div className="relative ml-1">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                    title={user.name}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          setShowUserMenu(false);
                          await onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Personal Account</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-3 py-2">
          <div className="flex items-center justify-around">
            <button
              type="button"
              onClick={() => onTabChange("overview")}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                activeTab === "overview"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">Overview</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("expenses")}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                activeTab === "expenses"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Receipt className="w-5 h-5" />
              <span className="text-[10px]">Expenses</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("charts")}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                activeTab === "charts"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span className="text-[10px]">Charts</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("notes")}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                activeTab === "notes"
                  ? "text-indigo-400 font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <StickyNote className="w-5 h-5" />
              <span className="text-[10px]">Notes</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

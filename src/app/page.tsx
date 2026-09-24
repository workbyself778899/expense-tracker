"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import QuickStats from "@/components/QuickStats";
import ChartsView from "@/components/ChartsView";
import ExpenseList from "@/components/ExpenseList";
import ExpenseModal from "@/components/ExpenseModal";
import NotesView from "@/components/NotesView";
import RichNoteEditor from "@/components/RichNoteEditor";
import AuthView from "@/components/AuthView";
import { IExpense, INote, IDashboardStats, IUser } from "@/types";
import {
  ArrowRight,
  TrendingUp,
  Receipt,
  StickyNote,
  AlertCircle,
  Plus,
} from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "charts" | "notes">("overview");
  const [timeRange, setTimeRange] = useState("30d");

  // Data states
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [notes, setNotes] = useState<INote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);

  // Check user session
  const checkUserSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // Fetch all dashboard data for the authenticated user
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setErrorMessage(null);
      const [statsRes, expensesRes, notesRes] = await Promise.all([
        fetch(`/api/stats?timeRange=${timeRange}`),
        fetch("/api/expenses?limit=100"),
        fetch("/api/notes"),
      ]);

      const statsJson = await statsRes.json();
      const expensesJson = await expensesRes.json();
      const notesJson = await notesRes.json();

      if (statsJson.success) {
        setStats(statsJson.data);
      }
      if (expensesJson.success) {
        setExpenses(expensesJson.data);
      }
      if (notesJson.success) {
        setNotes(notesJson.data);
      }
    } catch (err: unknown) {
      console.error("Error loading dashboard data:", err);
      setErrorMessage("Could not connect to database. Ensure MongoDB is running.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, timeRange]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setStats(null);
      setExpenses([]);
      setNotes([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Expense Handlers
  const handleSaveExpense = async (data: Partial<IExpense>) => {
    try {
      const url = editingExpense?._id
        ? `/api/expenses/${editingExpense._id}`
        : "/api/expenses";
      const method = editingExpense?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Failed to save transaction");
        return;
      }

      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving transaction");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await fetchData();
      } else {
        alert(json.error || "Failed to delete transaction");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting transaction");
    }
  };

  // Note Handlers
  const handleSaveNote = async (data: Partial<INote>, id?: string) => {
    try {
      const targetId = id || editingNote?._id;
      const url = targetId ? `/api/notes/${targetId}` : "/api/notes";
      const method = targetId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Failed to save note");
        return;
      }

      setIsNoteEditorOpen(false);
      setEditingNote(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving note");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await fetchData();
      } else {
        alert(json.error || "Failed to delete note");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting note");
    }
  };

  const handleOpenLinkedNote = (noteId: string) => {
    const found = notes.find((n) => n._id === noteId);
    if (found) {
      setEditingNote(found);
      setIsNoteEditorOpen(true);
    } else {
      setActiveTab("notes");
    }
  };

  // Loading spinner while checking initial auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs font-medium">Loading Expense Tracker...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show modern Login / Register view
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
        <Navbar
          user={null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenNewExpense={() => {}}
          onOpenNewNote={() => {}}
          onLogout={handleLogout}
        />
        <AuthView
          onSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col pb-20 md:pb-12">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenNewNote={() => {
          setEditingNote(null);
          setIsNoteEditorOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1">
        {/* Error Notification if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 font-semibold transition flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <QuickStats stats={stats} isLoading={isLoading} />

            {/* Primary Visualizer Section: Trends & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Main Spending Timeline Chart */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h2 className="text-sm font-bold text-slate-100">
                      Personal Expense & Cashflow Analytics
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("charts")}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
                  >
                    <span>View all charts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ChartsView
                  stats={stats}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  isLoading={isLoading}
                />
              </div>

              {/* Right 1 Col: Recent Notes & Quick Access */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold text-slate-100">
                      Personal Notes
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notes")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                  >
                    <span>All notes ({notes.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8">
                      <StickyNote className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No notes created yet</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNote(null);
                          setIsNoteEditorOpen(true);
                        }}
                        className="mt-2 text-xs font-medium text-indigo-400 hover:underline"
                      >
                        + Create your first note
                      </button>
                    </div>
                  ) : (
                    notes.slice(0, 3).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleOpenLinkedNote(n._id || "")}
                        className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {n.category}
                          </span>
                          {n.handwritingDataUrl && (
                            <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-0.5">
                              ✍️ Drawing
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 truncate">
                          {n.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {n.plainText || "Rich formatted note"}
                        </p>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(null);
                      setIsNoteEditorOpen(true);
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Note</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-100">
                    Recent Transactions
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("expenses")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
                >
                  <span>View all transactions ({expenses.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <ExpenseList
                expenses={expenses.slice(0, 8)}
                isLoading={isLoading}
                onEdit={(tx) => {
                  setEditingExpense(tx);
                  setIsExpenseModalOpen(true);
                }}
                onDelete={handleDeleteExpense}
                onAddNew={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                onViewNote={handleOpenLinkedNote}
              />
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS / EXPENSES */}
        {activeTab === "expenses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  Transactions & Expense History
                </h2>
                <p className="text-xs text-slate-400">
                  Manage all personal income and expenses with search, categories, and date filters
                </p>
              </div>
            </div>

            <ExpenseList
              expenses={expenses}
              isLoading={isLoading}
              onEdit={(tx) => {
                setEditingExpense(tx);
                setIsExpenseModalOpen(true);
              }}
              onDelete={handleDeleteExpense}
              onAddNew={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              onViewNote={handleOpenLinkedNote}
            />
          </div>
        )}

        {/* TAB 3: CHARTS & ANALYTICS */}
        {activeTab === "charts" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Visual Analytics & Multiple Charts
              </h2>
              <p className="text-xs text-slate-400">
                Detailed breakdowns of your personal spending trends, category distribution, cash flow, and payment channels
              </p>
            </div>

            <ChartsView
              stats={stats}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 4: NOTES & HANDWRITING */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Personal Rich Notes & Mobile Handwriting</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  H1/H2 • Bold • Colors • Canvas
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Private notes with single-line formatting toolbar (H1, H2, Bold, Italic, Underline, Colors) or freehand handwriting sketches.
              </p>
            </div>

            <NotesView
              notes={notes}
              isLoading={isLoading}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        )}
      </main>

      {/* Expense Modal (Add / Edit) */}
      {isExpenseModalOpen && (
        <ExpenseModal
          initialExpense={editingExpense}
          notesList={notes}
          onSave={handleSaveExpense}
          onCancel={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* Note Editor Modal (Add / Edit) */}
      {isNoteEditorOpen && (
        <RichNoteEditor
          initialNote={editingNote}
          onSave={async (data) => {
            await handleSaveNote(data, editingNote?._id);
          }}
          onCancel={() => {
            setIsNoteEditorOpen(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
}

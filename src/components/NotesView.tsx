"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Pin,
  Edit3,
  Trash2,
  PenTool,
  Tag,
  FolderOpen,
  Calendar,
  Sparkles,
} from "lucide-react";
import { INote, NoteCategory } from "@/types";
import RichNoteEditor from "./RichNoteEditor";
import HandwritingPad from "./HandwritingPad";

interface NotesViewProps {
  notes: INote[];
  isLoading?: boolean;
  onSaveNote: (noteData: Partial<INote>, id?: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

const CATEGORIES: (NoteCategory | "All")[] = [
  "All",
  "Budget Planning",
  "Receipt & Bills",
  "Shopping List",
  "Financial Goals",
  "Tax & Accounting",
  "Investment Idea",
  "General",
];

const THEME_STYLES: Record<string, { border: string; bg: string; badge: string }> = {
  indigo: {
    border: "border-indigo-500/30 hover:border-indigo-400",
    bg: "bg-indigo-950/20",
    badge: "bg-indigo-900/50 text-indigo-300 border-indigo-700/50",
  },
  emerald: {
    border: "border-emerald-500/30 hover:border-emerald-400",
    bg: "bg-emerald-950/20",
    badge: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  },
  amber: {
    border: "border-amber-500/30 hover:border-amber-400",
    bg: "bg-amber-950/20",
    badge: "bg-amber-900/50 text-amber-300 border-amber-700/50",
  },
  rose: {
    border: "border-rose-500/30 hover:border-rose-400",
    bg: "bg-rose-950/20",
    badge: "bg-rose-900/50 text-rose-300 border-rose-700/50",
  },
  purple: {
    border: "border-purple-500/30 hover:border-purple-400",
    bg: "bg-purple-950/20",
    badge: "bg-purple-900/50 text-purple-300 border-purple-700/50",
  },
  blue: {
    border: "border-blue-500/30 hover:border-blue-400",
    bg: "bg-blue-950/20",
    badge: "bg-blue-900/50 text-blue-300 border-blue-700/50",
  },
};

export default function NotesView({
  notes,
  isLoading = false,
  onSaveNote,
  onDeleteNote,
}: NotesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNote, setEditingNote] = useState<INote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [quickDrawNote, setQuickDrawNote] = useState<INote | null>(null);
  const [isQuickDrawOpen, setIsQuickDrawOpen] = useState(false);

  // Filter notes
  const filtered = notes.filter((n) => {
    const matchesCat =
      selectedCategory === "All" || n.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.plainText && n.plainText.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesCat && matchesSearch;
  });

  const pinnedNotes = filtered.filter((n) => n.isPinned);
  const regularNotes = filtered.filter((n) => !n.isPinned);

  const handleCreateNew = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (n: INote) => {
    setEditingNote(n);
    setIsEditorOpen(true);
  };

  const handleTogglePin = async (n: INote) => {
    if (!n._id) return;
    await onSaveNote({ isPinned: !n.isPinned }, n._id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await onDeleteNote(id);
    }
  };

  // Open direct handwriting modal for a note or new note
  const handleOpenHandwriting = (n?: INote) => {
    if (n) {
      setQuickDrawNote(n);
    } else {
      setQuickDrawNote({
        title: `Handwritten Note - ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        content: "<p>Mobile handwritten sketch note</p>",
        category: "General",
        color: "indigo",
        isPinned: false,
        tags: ["handwritten", "sketch"],
      });
    }
    setIsQuickDrawOpen(true);
  };

  const handleSaveDrawing = async (dataUrl: string) => {
    if (!quickDrawNote) return;
    if (quickDrawNote._id) {
      await onSaveNote({ handwritingDataUrl: dataUrl }, quickDrawNote._id);
    } else {
      await onSaveNote({
        ...quickDrawNote,
        handwritingDataUrl: dataUrl,
      });
    }
    setIsQuickDrawOpen(false);
    setQuickDrawNote(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes, checklists, budget plans, tags..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Mobile Draw / Stylus button */}
          <button
            type="button"
            onClick={() => handleOpenHandwriting()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/60 shadow transition"
            title="Scribble / Handwrite note (Touch & Stylus)"
          >
            <PenTool className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Mobile Handwriting</span>
            <span className="sm:hidden">Draw</span>
          </button>

          {/* New Rich Note Button */}
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No notes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Keep track of your financial plans, receipts, grocery checklists, or scribble freehand sketches on mobile.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition"
            >
              Write First Note
            </button>
            <button
              type="button"
              onClick={() => handleOpenHandwriting()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950 border border-indigo-700 hover:bg-indigo-900 shadow-md transition"
            >
              ✍️ Handwrite Sketch
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-3 px-1">
                <Pin className="w-3.5 h-3.5" />
                <span>PINNED NOTES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={() => handleEdit(note)}
                    onTogglePin={() => handleTogglePin(note)}
                    onDelete={() => note._id && handleDelete(note._id)}
                    onOpenHandwriting={() => handleOpenHandwriting(note)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes Section */}
          {regularNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="text-xs font-semibold text-slate-400 mb-3 px-1">
                  ALL NOTES
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={() => handleEdit(note)}
                    onTogglePin={() => handleTogglePin(note)}
                    onDelete={() => note._id && handleDelete(note._id)}
                    onOpenHandwriting={() => handleOpenHandwriting(note)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rich Note Editor Modal */}
      {isEditorOpen && (
        <RichNoteEditor
          initialNote={editingNote}
          onSave={async (data) => {
            await onSaveNote(data, editingNote?._id);
            setIsEditorOpen(false);
            setEditingNote(null);
          }}
          onCancel={() => {
            setIsEditorOpen(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* Quick Handwriting Pad Modal */}
      {isQuickDrawOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <HandwritingPad
            initialDataUrl={quickDrawNote?.handwritingDataUrl}
            onSave={handleSaveDrawing}
            onCancel={() => {
              setIsQuickDrawOpen(false);
              setQuickDrawNote(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Single Note Card Component
function NoteCard({
  note,
  onEdit,
  onTogglePin,
  onDelete,
  onOpenHandwriting,
}: {
  note: INote;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onOpenHandwriting: () => void;
}) {
  const theme = THEME_STYLES[note.color || "indigo"] || THEME_STYLES.indigo;
  const dateStr = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border ${theme.border} ${theme.bg} shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${theme.badge}`}
          >
            {note.category}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 rounded-md transition ${
                note.isPinned
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title={note.isPinned ? "Unpin note" : "Pin note"}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition"
              title="Edit note"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={onEdit}
          className="text-sm font-bold text-slate-100 mb-2 cursor-pointer hover:text-indigo-300 transition line-clamp-1"
        >
          {note.title}
        </h3>

        {/* Rich HTML Content Preview */}
        <div
          onClick={onEdit}
          className="note-rich-content text-xs text-slate-300 line-clamp-4 cursor-pointer mb-3 opacity-90"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        {/* Handwriting Canvas Thumbnail (If present) */}
        {note.handwritingDataUrl && (
          <div
            onClick={onOpenHandwriting}
            className="mb-3 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950/80 p-1 cursor-pointer group-hover:border-indigo-500/40 transition"
            title="Click to view/edit handwriting sketch"
          >
            <div className="flex items-center justify-between text-[10px] text-indigo-400 px-1 pb-1">
              <span className="flex items-center gap-1 font-medium">
                <PenTool className="w-2.5 h-2.5" />
                Handwritten Doodle
              </span>
              <span className="text-[9px] text-slate-500">Touch/Edit</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={note.handwritingDataUrl}
              alt="Handwriting sketch thumbnail"
              className="w-full h-24 object-contain rounded bg-slate-950"
            />
          </div>
        )}
      </div>

      {/* Card Footer: Tags & Date */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 mt-2">
        <div className="flex items-center gap-1 truncate max-w-[65%]">
          {note.tags && note.tags.length > 0 ? (
            note.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800"
              >
                <Tag className="w-2.5 h-2.5 text-slate-500" />
                {t}
              </span>
            ))
          ) : (
            <span className="text-slate-600 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Note
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-600" />
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  );
}

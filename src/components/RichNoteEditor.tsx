"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Palette,
  Highlighter,
  PenTool,
  Save,
  X,
  Pin,
  Trash2,
  Tag,
  FolderOpen,
} from "lucide-react";
import { INote, NoteCategory } from "@/types";
import HandwritingPad from "./HandwritingPad";

interface RichNoteEditorProps {
  initialNote?: Partial<INote> | null;
  onSave: (noteData: Partial<INote>) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: NoteCategory[] = [
  "General",
  "Budget Planning",
  "Receipt & Bills",
  "Shopping List",
  "Financial Goals",
  "Tax & Accounting",
  "Investment Idea",
];

const NOTE_COLORS = [
  { name: "indigo", bg: "bg-indigo-950/40 border-indigo-500/30 text-indigo-400" },
  { name: "emerald", bg: "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" },
  { name: "amber", bg: "bg-amber-950/40 border-amber-500/30 text-amber-400" },
  { name: "rose", bg: "bg-rose-950/40 border-rose-500/30 text-rose-400" },
  { name: "purple", bg: "bg-purple-950/40 border-purple-500/30 text-purple-400" },
  { name: "blue", bg: "bg-blue-950/40 border-blue-500/30 text-blue-400" },
];

const TEXT_COLORS = [
  { name: "Default (White)", color: "#f8fafc" },
  { name: "Sky Blue", color: "#38bdf8" },
  { name: "Emerald Green", color: "#34d399" },
  { name: "Amber Orange", color: "#fbbf24" },
  { name: "Rose Pink", color: "#fb7185" },
  { name: "Purple", color: "#c084fc" },
  { name: "Silver", color: "#94a3b8" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", color: "transparent" },
  { name: "Yellow", color: "rgba(250, 204, 21, 0.35)" },
  { name: "Green", color: "rgba(52, 211, 153, 0.35)" },
  { name: "Blue", color: "rgba(56, 189, 248, 0.35)" },
  { name: "Pink", color: "rgba(244, 114, 182, 0.35)" },
];

export default function RichNoteEditor({
  initialNote,
  onSave,
  onCancel,
}: RichNoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || "");
  const [category, setCategory] = useState<NoteCategory>(
    (initialNote?.category as NoteCategory) || "General"
  );
  const [color, setColor] = useState(initialNote?.color || "indigo");
  const [isPinned, setIsPinned] = useState(initialNote?.isPinned || false);
  const [tagsInput, setTagsInput] = useState(
    initialNote?.tags ? initialNote.tags.join(", ") : ""
  );
  const [handwritingData, setHandwritingData] = useState<string | undefined>(
    initialNote?.handwritingDataUrl
  );
  const [showHandwritingModal, setShowHandwritingModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      if (initialNote?.content) {
        editorRef.current.innerHTML = initialNote.content;
      } else if (!editorRef.current.innerHTML) {
        editorRef.current.innerHTML = "<p>Start typing your note here...</p>";
      }
    }
  }, [initialNote]);

  // Execute formatting command on text selection
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleHeading = (tag: "H1" | "H2" | "H3" | "P") => {
    if (tag === "P") {
      execCmd("formatBlock", "<p>");
    } else {
      execCmd("formatBlock", `<${tag.toLowerCase()}>`);
    }
  };

  const handleTextColor = (c: string) => {
    execCmd("foreColor", c);
    setShowColorPicker(false);
  };

  const handleHighlight = (c: string) => {
    execCmd("hiliteColor", c);
    setShowHighlightPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please give your note a title.");
      return;
    }

    const contentHtml = editorRef.current ? editorRef.current.innerHTML : "";
    const plainText = editorRef.current ? editorRef.current.innerText : "";

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: contentHtml,
        plainText,
        category,
        color,
        isPinned,
        handwritingDataUrl: handwritingData,
        tags,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FolderOpen className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">
              {initialNote?._id ? "Edit Note" : "Create New Note"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Pin Button */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-lg border transition ${
                isPinned
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
              title={isPinned ? "Pinned Note" : "Pin Note"}
            >
              <Pin className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          {/* Title & Metadata Bar */}
          <div className="p-5 pb-3 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title (e.g. Monthly Budget Plan, Tech Setup Receipt...)"
              className="w-full text-xl font-bold bg-transparent text-slate-100 placeholder-slate-500 border-b border-slate-800 pb-2 focus:outline-none focus:border-indigo-500 transition"
              required
            />

            {/* Quick settings row: Category, Color theme, Tags */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-400 font-medium">Category:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoteCategory)}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Theme Accent Color */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-400 font-medium">Theme:</span>
                <div className="flex items-center gap-1">
                  {NOTE_COLORS.map((nc) => (
                    <button
                      key={nc.name}
                      type="button"
                      onClick={() => setColor(nc.name)}
                      className={`w-3.5 h-3.5 rounded-full border transition transform hover:scale-125 ${
                        color === nc.name
                          ? "ring-2 ring-white scale-110"
                          : "opacity-70"
                      } ${
                        nc.name === "indigo"
                          ? "bg-indigo-500 border-indigo-300"
                          : nc.name === "emerald"
                          ? "bg-emerald-500 border-emerald-300"
                          : nc.name === "amber"
                          ? "bg-amber-500 border-amber-300"
                          : nc.name === "rose"
                          ? "bg-rose-500 border-rose-300"
                          : nc.name === "purple"
                          ? "bg-purple-500 border-purple-300"
                          : "bg-blue-500 border-blue-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Tags Input */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2.5 py-1.5 rounded-lg flex-1 min-w-[200px]">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Tags (comma separated)..."
                  className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* SINGLE-LINE RICH FORMATTING TOOLBAR (As specifically requested by user) */}
          <div className="sticky top-0 z-20 mx-5 my-1 flex items-center gap-1 p-1.5 bg-slate-950/90 border border-slate-700/80 rounded-xl backdrop-blur-md overflow-x-auto no-scrollbar shadow-md">
            {/* Headings */}
            <div className="flex items-center border-r border-slate-800 pr-1.5 mr-1 gap-1">
              <button
                type="button"
                onClick={() => handleHeading("H1")}
                className="px-2 py-1 text-xs font-bold rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => handleHeading("H2")}
                className="px-2 py-1 text-xs font-bold rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleHeading("H3")}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => handleHeading("P")}
                className="px-2 py-1 text-xs rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Normal paragraph"
              >
                P
              </button>
            </div>

            {/* Basic Format: Bold, Italic, Underline, Strike */}
            <div className="flex items-center border-r border-slate-800 pr-1.5 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => execCmd("bold")}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => execCmd("italic")}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition italic"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => execCmd("underline")}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition underline"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => execCmd("strikeThrough")}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text Color Picker */}
            <div className="relative border-r border-slate-800 pr-1.5 mr-1">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Text Color"
              >
                <Palette className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] hidden sm:inline">Color</span>
              </button>

              {showColorPicker && (
                <div className="absolute left-0 top-full mt-1 z-30 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl flex flex-col gap-1 w-36">
                  {TEXT_COLORS.map((tc) => (
                    <button
                      key={tc.name}
                      type="button"
                      onClick={() => handleTextColor(tc.color)}
                      className="flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-slate-800 transition text-left"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0"
                        style={{ backgroundColor: tc.color }}
                      />
                      <span className="text-slate-300 truncate">{tc.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Highlighter Picker */}
            <div className="relative border-r border-slate-800 pr-1.5 mr-1">
              <button
                type="button"
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Highlight Color"
              >
                <Highlighter className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[11px] hidden sm:inline">Highlight</span>
              </button>

              {showHighlightPicker && (
                <div className="absolute left-0 top-full mt-1 z-30 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl flex flex-col gap-1 w-32">
                  {HIGHLIGHT_COLORS.map((hc) => (
                    <button
                      key={hc.name}
                      type="button"
                      onClick={() => handleHighlight(hc.color)}
                      className="flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-slate-800 transition text-left"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded border border-slate-600 flex-shrink-0"
                        style={{ backgroundColor: hc.color }}
                      />
                      <span className="text-slate-300">{hc.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lists & Quotes */}
            <div className="flex items-center border-r border-slate-800 pr-1.5 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => execCmd("insertUnorderedList")}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => execCmd("insertOrderedList")}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => execCmd("formatBlock", "<blockquote>")}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Quote Block"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Handwriting / Drawing Canvas Trigger */}
            <button
              type="button"
              onClick={() => setShowHandwritingModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600/30 to-blue-600/30 hover:from-indigo-600/50 hover:to-blue-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition ml-auto flex-shrink-0"
              title="Draw / Handwrite note (Touch & Stylus)"
            >
              <PenTool className="w-3.5 h-3.5 text-indigo-400" />
              <span>✍️ Handwrite / Doodle</span>
            </button>
          </div>

          {/* Note Body: Content Editable Area */}
          <div className="p-5 flex-1 min-h-[220px]">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="note-rich-content w-full min-h-[200px] text-slate-200 text-sm focus:outline-none leading-relaxed p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 focus:border-indigo-500/50 transition"
            />

            {/* Handwriting / Sketch Attachment Preview */}
            {handwritingData && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                    Handwritten Sketch / Drawing Attachment:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowHandwritingModal(true)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit Drawing
                    </button>
                    <button
                      type="button"
                      onClick={() => setHandwritingData(undefined)}
                      className="text-xs text-rose-400 hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 max-h-48 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={handwritingData}
                    alt="Handwritten note sketch"
                    className="max-h-44 object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/80">
            <span className="text-xs text-slate-400">
              Auto-saves to your local database or cloud MongoDB
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Handwriting Canvas Modal */}
      {showHandwritingModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <HandwritingPad
            initialDataUrl={handwritingData}
            onSave={(dataUrl) => {
              setHandwritingData(dataUrl);
              setShowHandwritingModal(false);
            }}
            onCancel={() => setShowHandwritingModal(false)}
          />
        </div>
      )}
    </div>
  );
}

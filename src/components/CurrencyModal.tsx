"use client";

import React, { useState, useEffect } from "react";
import { X, Coins, Check, ArrowRight } from "lucide-react";
import {
  useCurrency,
  PRESET_CURRENCIES,
  formatValueWithCurrency,
} from "@/context/CurrencyContext";

export default function CurrencyModal() {
  const { currency, setCurrency, isCurrencyModalOpen, setIsCurrencyModalOpen } =
    useCurrency();

  const [selected, setSelected]     = useState(currency);
  const [custom, setCustom]         = useState("");
  const [isCustom, setIsCustom]     = useState(false);
  const [saving, setSaving]         = useState(false);

  // Sync on open
  useEffect(() => {
    if (isCurrencyModalOpen) {
      setSelected(currency);
      const isPreset = PRESET_CURRENCIES.some(
        (p) => p.symbol === currency || p.code === currency
      );
      if (!isPreset) {
        setIsCustom(true);
        setCustom(currency);
      } else {
        setIsCustom(false);
        setCustom("");
      }
    }
  }, [isCurrencyModalOpen, currency]);

  if (!isCurrencyModalOpen) return null;

  const activeValue = isCustom ? (custom || "…") : selected;

  const handleApply = async () => {
    const target = isCustom ? custom.trim() || "NRP" : selected.trim() || "NRP";
    setSaving(true);
    try {
      await setCurrency(target);
      setIsCurrencyModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && setIsCurrencyModalOpen(false)}
    >
      <div className="animate-slide-up w-full sm:max-w-sm sm:mx-4 rounded-t-3xl sm:rounded-3xl bg-[#0f1623] border border-white/[0.08] shadow-2xl p-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Coins className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Currency</h2>
              <p className="text-[11px] text-slate-400">Choose or enter a symbol</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCurrencyModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live preview */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">Preview</p>
            <p className="text-sm font-mono font-bold text-emerald-400">
              {formatValueWithCurrency(45000, activeValue, { showSign: true, isExpense: false })}
            </p>
            <p className="text-sm font-mono font-bold text-rose-400">
              {formatValueWithCurrency(1250, activeValue, { showSign: true, isExpense: true })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">Active</p>
            <p className="text-lg font-bold font-mono text-amber-400">{activeValue}</p>
          </div>
        </div>

        {/* Currency presets */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Popular</p>
          <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto">
            {PRESET_CURRENCIES.map((p) => {
              const isSelected = !isCustom && selected === p.symbol;
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => { setSelected(p.symbol); setIsCustom(false); }}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-center transition-all text-xs ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500/60 text-blue-300"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-white active:scale-95"
                  }`}
                >
                  <span className="font-bold text-sm font-mono leading-tight">{p.symbol}</span>
                  <span className="text-[10px] text-slate-500 truncate w-full mt-0.5">{p.code}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-400 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom input */}
        <div className="border-t border-white/[0.06] pt-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Custom</p>
          <input
            type="text"
            value={custom}
            onFocus={() => setIsCustom(true)}
            onChange={(e) => {
              setCustom(e.target.value);
              setSelected(e.target.value.trim() || "NRP");
            }}
            placeholder="e.g. NRP, INR, Rs., रू, $"
            maxLength={10}
            className={`w-full h-11 px-3.5 bg-white/[0.04] border rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition ${
              isCustom
                ? "border-amber-500/60 ring-1 ring-amber-500/20"
                : "border-white/[0.08] focus:border-blue-500/50"
            }`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsCurrencyModalOpen(false)}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-slate-400 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || (isCustom && !custom.trim())}
            onClick={handleApply}
            className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? "Saving…" : "Apply"}
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface CurrencyPreset {
  code: string;
  name: string;
  symbol: string;
}

export const PRESET_CURRENCIES: CurrencyPreset[] = [
  { code: "NRP", name: "Nepalese Rupee (NRP)", symbol: "NRP" },
  { code: "INR", name: "Indian Rupee (INR)", symbol: "INR" },
  { code: "NPR", name: "Nepalese Rupee (रू)", symbol: "रू" },
  { code: "INR_SYM", name: "Indian Rupee (₹)", symbol: "₹" },
  { code: "USD", name: "US Dollar ($)", symbol: "$" },
  { code: "EUR", name: "Euro (€)", symbol: "€" },
  { code: "GBP", name: "British Pound (£)", symbol: "£" },
  { code: "AED", name: "UAE Dirham (AED)", symbol: "AED" },
  { code: "AUD", name: "Australian Dollar (A$)", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar (C$)", symbol: "C$" },
];

export interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatAmount: (
    val: number | string | undefined,
    options?: { showSign?: boolean; isExpense?: boolean }
  ) => string;
  isCurrencyModalOpen: boolean;
  setIsCurrencyModalOpen: (open: boolean) => void;
  syncUserCurrency: (userCurrency?: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "expense_tracker_currency";
const DEFAULT_CURRENCY =
  process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "NRP";

export function formatValueWithCurrency(
  val: number | string | undefined,
  curr: string,
  options?: { showSign?: boolean; isExpense?: boolean }
): string {
  const num = typeof val === "number" ? val : Number(val || 0);
  const safeNum = isNaN(num) ? 0 : num;
  const absNum = Math.abs(safeNum);

  const formattedNum = absNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // If currency is a single symbol or special currency glyph like $, €, £, ₹, रू
  const isCompactSymbol =
    curr.length === 1 || curr === "रू" || curr === "₹" || curr === "Rs.";

  const currencyFormatted = isCompactSymbol
    ? `${curr}${formattedNum}`
    : `${curr} ${formattedNum}`;

  if (options?.showSign) {
    if (options.isExpense !== undefined) {
      return options.isExpense ? `-${currencyFormatted}` : `+${currencyFormatted}`;
    }
    return safeNum < 0 ? `-${currencyFormatted}` : `+${currencyFormatted}`;
  }

  return safeNum < 0 ? `-${currencyFormatted}` : currencyFormatted;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // Load initial currency from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored && stored.trim()) {
        setCurrencyState(stored.trim());
      }
    } catch {
      // localStorage may fail in restricted iframes
    }
  }, []);

  const syncUserCurrency = useCallback((userCurrency?: string) => {
    if (userCurrency && userCurrency.trim()) {
      setCurrencyState(userCurrency.trim());
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, userCurrency.trim());
      } catch {
        // ignore
      }
    }
  }, []);

  const setCurrency = useCallback(async (newCurr: string) => {
    const trimmed = newCurr.trim() || "NRP";
    setCurrencyState(trimmed);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
    } catch {
      // ignore
    }

    // Persist to user profile if logged in
    try {
      await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: trimmed }),
      });
    } catch {
      // ignore network errors if not authenticated
    }
  }, []);

  const formatAmount = useCallback(
    (
      val: number | string | undefined,
      options?: { showSign?: boolean; isExpense?: boolean }
    ) => {
      return formatValueWithCurrency(val, currency, options);
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        isCurrencyModalOpen,
        setIsCurrencyModalOpen,
        syncUserCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

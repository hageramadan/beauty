// contexts/CurrencyContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSettings } from "@/services/settingsApi";

interface CurrencyContextType {
  currency: string | null;
  isLoading: boolean;
  error: string | null;
  refreshCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchCurrency = async () => {
    // منع الطلبات المتكررة
    if (fetched && currency) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // محاولة جلب العملة من localStorage أولاً
      const cachedCurrency = localStorage.getItem("currency");
      if (cachedCurrency) {
        setCurrency(cachedCurrency);
        setIsLoading(false);
        setFetched(true);
        return;
      }

      // جلب العملة من API
      const settings = await getSettings();

      if (settings?.setting?.currency) {
        const currencyCode = settings.setting.currency;
        setCurrency(currencyCode);
        localStorage.setItem("currency", currencyCode);
        setFetched(true);
      }
    } catch (err) {
      console.error("Error fetching currency:", err);
      setError("Failed to load currency settings");
      // استخدم العملة الافتراضية
      setCurrency("Egp");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  const refreshCurrency = async () => {
    setFetched(false);
    await fetchCurrency();
  };

  return (
    <CurrencyContext.Provider value={{ currency, isLoading, error, refreshCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
// hooks/useCurrency.ts
import { useState, useEffect } from "react";
import { getSettings } from "@/services/settingsApi";

// ✅ Singleton pattern - يجلب العملة مرة واحدة فقط
let cachedCurrency: string | null = null;
let fetchPromise: Promise<string | null> | null = null;
let isFetching = false;

const fetchCurrencyFromAPI = async (): Promise<string | null> => {
  // إذا كانت العملة مخزنة مسبقاً، أرجعها فوراً
  if (cachedCurrency) {
    return cachedCurrency;
  }

  // إذا كان هناك طلب قيد التنفيذ، انتظره
  if (fetchPromise) {
    return fetchPromise;
  }

  // منع الطلبات المتكررة
  if (isFetching) {
    return cachedCurrency || "Egp";
  }

  isFetching = true;

  fetchPromise = (async () => {
    try {
      // محاولة جلب العملة من localStorage أولاً
      const storedCurrency = localStorage.getItem("currency");
      if (storedCurrency) {
        cachedCurrency = storedCurrency;
        isFetching = false;
        return cachedCurrency;
      }

      // جلب العملة من API
      const settings = await getSettings();

      if (settings?.setting?.currency) {
        const currencyCode = settings.setting.currency;
        cachedCurrency = currencyCode;
        localStorage.setItem("currency", currencyCode);
        isFetching = false;
        return cachedCurrency;
      }

      // إذا لم توجد عملة، استخدم الافتراضية
      cachedCurrency = "Egp";
      isFetching = false;
      return cachedCurrency;
    } catch (error) {
      console.error("Error fetching currency:", error);
      cachedCurrency = "Egp";
      isFetching = false;
      return cachedCurrency;
    }
  })();

  return fetchPromise;
};

interface UseCurrencyReturn {
  currency: string | null;
  isLoading: boolean;
  error: string | null;
  refreshCurrency: () => Promise<void>;
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrency] = useState<string | null>(cachedCurrency);
  const [isLoading, setIsLoading] = useState(!cachedCurrency);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCurrency = async () => {
      // إذا كانت العملة موجودة بالفعل، لا تجلب مرة أخرى
      if (cachedCurrency) {
        setCurrency(cachedCurrency);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await fetchCurrencyFromAPI();
        if (isMounted) {
          setCurrency(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load currency");
          setCurrency("Egp");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCurrency();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshCurrency = async () => {
    // إعادة تعيين التخزين المؤقت
    cachedCurrency = null;
    fetchPromise = null;
    isFetching = false;
    localStorage.removeItem("currency");

    // جلب من جديد
    try {
      setIsLoading(true);
      const result = await fetchCurrencyFromAPI();
      setCurrency(result);
      setError(null);
    } catch (err) {
      setError("Failed to refresh currency");
    } finally {
      setIsLoading(false);
    }
  };

  return { currency, isLoading, error, refreshCurrency };
}
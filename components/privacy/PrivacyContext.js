"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const PrivacyContext = createContext();

export function PrivacyProvider({ children }) {
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lunaskan_privacy");
    if (saved) setIsPrivate(saved === "true");
  }, []);

  const togglePrivacy = useCallback(() => {
    setIsPrivate((prev) => {
      const next = !prev;
      localStorage.setItem("lunaskan_privacy", String(next));
      return next;
    });
  }, []);

  const formatMoney = useCallback((amount) => {
    if (isPrivate) return "Rp •••••••";
    const num = Number(amount);
    return !isNaN(num) ? `Rp ${num.toLocaleString('id-ID')}` : amount;
  }, [isPrivate]);

  const maskString = useCallback((str) => {
    if (isPrivate) return "•••••••";
    return str;
  }, [isPrivate]);

  const value = useMemo(
    () => ({ isPrivate, togglePrivacy, formatMoney, maskString }),
    [isPrivate, togglePrivacy, formatMoney, maskString]
  );

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

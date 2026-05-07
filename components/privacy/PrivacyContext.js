"use client";

import { createContext, useContext, useState, useEffect } from "react";

const PrivacyContext = createContext();

export function PrivacyProvider({ children }) {
  const [isPrivate, setIsPrivate] = useState(false);

  // Load state from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("lunasin_privacy");
    if (saved) {
      setIsPrivate(saved === "true");
    }
  }, []);

  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      const next = !prev;
      localStorage.setItem("lunasin_privacy", next);
      return next;
    });
  };

  const formatMoney = (amount) => {
    if (isPrivate) return "Rp •••••••";
    
    const num = Number(amount);
    if (!isNaN(num)) {
      return `Rp ${num.toLocaleString('id-ID')}`;
    }
    
    return amount;
  };

  const maskString = (str) => {
    if (isPrivate) return "•••••••";
    return str;
  };

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, formatMoney, maskString }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

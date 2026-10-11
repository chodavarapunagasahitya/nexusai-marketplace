import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  JPY: '¥',
  AUD: 'A$'
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState({
    USD: 1,
    EUR: 0.892,
    GBP: 0.768,
    INR: 83.92,
    CAD: 1.354,
    JPY: 148.65,
    AUD: 1.482
  });
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/live-data/currency');
      const data = await res.json();
      if (data.success && data.rates) {
        setRates(data.rates);
        setIsLive(data.live);
        setLastUpdated(data.lastUpdated);
      }
    } catch (err) {
      console.warn('Currency fetch fallback used');
    }
  };

  const convertPrice = (usdAmount) => {
    if (!usdAmount || isNaN(usdAmount)) return 0;
    const rate = rates[currency] || 1;
    return Math.round(usdAmount * rate);
  };

  const formatPrice = (usdAmount) => {
    if (usdAmount === undefined || usdAmount === null || isNaN(usdAmount)) return `${CURRENCY_SYMBOLS[currency] || '$'}0`;
    const converted = convertPrice(usdAmount);
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      rates,
      isLive,
      lastUpdated,
      convertPrice,
      formatPrice,
      symbols: CURRENCY_SYMBOLS
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'USD',
      setCurrency: () => {},
      rates: { USD: 1 },
      isLive: false,
      formatPrice: (amount) => `$${amount}`,
      convertPrice: (amount) => amount,
      symbols: CURRENCY_SYMBOLS
    };
  }
  return context;
}

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { TimeRange } from '../../api/types';

type Ctx = {
  range: TimeRange;
  rangeKey: '24h' | '7d' | '30d';
  setRangeKey: (k: '24h' | '7d' | '30d') => void;
  environment: string;
  setEnvironment: (e: string) => void;
};

const FilterCtx = createContext<Ctx | undefined>(undefined);

const toRange = (key: '24h' | '7d' | '30d', environment: string): TimeRange => {
  const to = new Date();
  const from = new Date();
  if (key === '24h') from.setDate(from.getDate() - 1);
  if (key === '7d') from.setDate(from.getDate() - 7);
  if (key === '30d') from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    environment: environment || undefined,
  };
};

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [rangeKey, setRangeKey] = useState<'24h' | '7d' | '30d'>('7d');
  const [environment, setEnvironment] = useState<string>('');
  const range = useMemo(() => toRange(rangeKey, environment), [rangeKey, environment]);
  return (
    <FilterCtx.Provider value={{ range, rangeKey, setRangeKey, environment, setEnvironment }}>
      {children}
    </FilterCtx.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
};

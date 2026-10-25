import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CHARTS, initialConfig, type ChartConfig } from './charts';

type Configs = Record<string, ChartConfig>;
interface Store { configs: Configs; update: (id: string, patch: Partial<ChartConfig>) => void; reset: (id: string) => void }
const Ctx = createContext<Store | null>(null);
const defaults = (): Configs => Object.fromEntries(CHARTS.map((d, i) => [d.id, initialConfig(d, i)]));

export const ChartStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [configs, setConfigs] = useState<Configs>(defaults);
  const update = useCallback((id: string, patch: Partial<ChartConfig>) => {
    setConfigs((c) => {
      const prev = c[id];
      return prev ? { ...c, [id]: { ...prev, ...patch, flags: { ...prev.flags, ...patch.flags } } } : c;
    });
  }, []);
  const reset = useCallback((id: string) => {
    const i = CHARTS.findIndex((d) => d.id === id);
    const def = CHARTS[i];
    if (def) setConfigs((c) => ({ ...c, [id]: initialConfig(def, i) }));
  }, []);
  const value = useMemo(() => ({ configs, update, reset }), [configs, update, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useChartStore = (): Store => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useChartStore must be used inside ChartStoreProvider');
  return s;
};

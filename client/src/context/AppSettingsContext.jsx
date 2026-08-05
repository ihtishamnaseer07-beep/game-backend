import { createContext, useContext, useEffect, useMemo } from 'react';
import { useAppSettings as useAppSettingsHook } from '../hooks/useAppSettings';

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const settingsState = useAppSettingsHook();
  const { settings } = settingsState;

  useEffect(() => {
    const theme = settings?.appTheme || {};

    document.documentElement.style.setProperty('--wt-primary', theme.primary || '#22c55e');
    document.documentElement.style.setProperty('--wt-secondary', theme.secondary || '#eab308');
    document.documentElement.style.setProperty('--wt-border', theme.border || '#334155');
    document.documentElement.style.setProperty('--wt-btn-radius', `${theme.buttonRadius || 12}px`);
    document.documentElement.style.setProperty('--wt-font-family', theme.fontFamily || 'Segoe UI, sans-serif');

    document.body.style.fontFamily = theme.fontFamily || 'Segoe UI, sans-serif';
    document.body.style.background = theme.background || '#020617';
  }, [settings]);

  const value = useMemo(() => settingsState, [settingsState]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

import { createContext, useContext, useEffect, useState } from 'react';
import { siteDefaults, deepMerge } from '../siteDefaults';

import { API_URL as API } from '../api';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((data) => {
        const map = data.settings || {};
        setSettings(map);
        return map;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const site = settings ? deepMerge(siteDefaults, settings.site || {}) : siteDefaults;

  return (
    <SettingsContext.Provider value={{ settings, site, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

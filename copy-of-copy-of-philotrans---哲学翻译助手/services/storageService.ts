import { HistoryItem, TranslationResult, AppSettings } from "../types";

const STORAGE_KEY = 'philo_trans_history';
const SETTINGS_KEY = 'philo_trans_settings';

// History Management
export const saveToHistory = (result: TranslationResult): HistoryItem => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...result,
    id: crypto.randomUUID(),
  };

  // Limit to last 50 items
  const newHistory = [newItem, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  return newItem;
};

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to read history", e);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const deleteHistoryItem = (id: string): HistoryItem[] => {
  const history = getHistory();
  const newHistory = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  return newHistory;
};

// Settings Management
export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { siliconFlowToken: '' };
  } catch (e) {
    return { siliconFlowToken: '' };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
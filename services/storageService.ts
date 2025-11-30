import { HistoryItem, TranslationResult, AppSettings } from "../types";

const STORAGE_KEY = 'philo_trans_history';
const SETTINGS_KEY = 'philo_trans_settings';

// Compatible UUID generator
const generateUUID = (): string => {
  // Try to use crypto.randomUUID() if available (HTTPS or secure context)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fall through to alternative implementation
    }
  }
  
  // Fallback: Generate UUID v4 using crypto.getRandomValues()
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    
    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
    
    // Convert to UUID string format
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  }
  
  // Last resort: Simple timestamp-based ID with random component
  return `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// History Management
export const saveToHistory = (result: TranslationResult): HistoryItem => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...result,
    id: generateUUID(),
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
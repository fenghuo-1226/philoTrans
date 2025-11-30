export enum TranslationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Term {
  original: string;
  translation: string;
  definition: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  terms: Term[];
  contextNote: string;
  timestamp: number;
  mode?: PromptMode;
  style?: TranslationStyle;
}

export interface HistoryItem extends TranslationResult {
  id: string;
}

export interface ProcessingError {
  message: string;
}

export interface AppSettings {
  siliconFlowToken: string;
}

export type PromptMode = 'translation' | 'note' | 'meeting' | 'polish';

export const PROMPT_MODES: { id: PromptMode; label: string; icon: string }[] = [
  { id: 'translation', label: '哲学深译', icon: 'Book' },
  { id: 'note', label: '学术笔记', icon: 'Notebook' },
  { id: 'meeting', label: '会议纪要', icon: 'Users' },
  { id: 'polish', label: '灵感润色', icon: 'Sparkles' },
];

export type TranslationStyle = 'academic' | 'literal' | 'liberal';

export const TRANSLATION_STYLES: { id: TranslationStyle; label: string; description: string }[] = [
  { id: 'academic', label: '学术严谨', description: '注重术语精确与学术规范' },
  { id: 'literal', label: '原典直译', description: '保留原文句法结构与语文学特征' },
  { id: 'liberal', label: '流畅意译', description: '侧重中文表达的通顺与可读性' },
];
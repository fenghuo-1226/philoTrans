import React, { useState } from 'react';
import { InputArea } from '../components/InputArea';
import { ResultView } from '../components/ResultView';
import { translateText } from '../services/geminiService';
import { saveToHistory } from '../services/storageService';
import { TranslationResult, TranslationStatus, PromptMode, TranslationStyle } from '../types';

export const Home: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<TranslationStatus>(TranslationStatus.IDLE);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const handleProcess = async (mode: PromptMode, style: TranslationStyle) => {
    if (!inputText.trim()) return;

    setStatus(TranslationStatus.LOADING);
    setResult(null);

    try {
      const translationData = await translateText(inputText, mode, style);
      
      const fullResult: TranslationResult = {
        originalText: inputText,
        ...translationData,
        timestamp: Date.now(),
        mode: mode,
        style: style
      };

      setResult(fullResult);
      saveToHistory(fullResult);
      setStatus(TranslationStatus.SUCCESS);
    } catch (error: any) {
      console.error('Translation error:', error);
      setStatus(TranslationStatus.ERROR);
      
      let errorMessage = "处理过程中发生错误。";
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage + "\n\n请检查：\n1. 是否已配置 SiliconFlow API Token\n2. API Token 是否有效\n3. 网络连接是否正常");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-serif font-medium text-stone-900 mb-3">
          智能学术助手
        </h2>
        <p className="text-stone-500">
          支持哲学文本翻译、语音笔记整理、会议纪要生成与灵感润色。
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
        <InputArea 
          text={inputText} 
          setText={setInputText} 
          onTranslate={handleProcess}
          isLoading={status === TranslationStatus.LOADING}
        />
      </div>

      {result && status === TranslationStatus.SUCCESS && (
        <ResultView result={result} />
      )}
    </main>
  );
};
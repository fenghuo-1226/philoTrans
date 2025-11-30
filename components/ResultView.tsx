import React, { useState } from 'react';
import { Book, Quote, Info, Columns, Rows } from 'lucide-react';
import { TranslationResult, Term, TRANSLATION_STYLES } from '../types';

interface ResultViewProps {
  result: TranslationResult;
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<'stacked' | 'split'>('stacked');
  const currentStyle = TRANSLATION_STYLES.find(s => s.id === result.style);

  return (
    <div className="mt-8 animate-fade-in">
      
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <h3 className="text-lg font-serif font-bold text-stone-900">生成结果</h3>
           {currentStyle && (
             <span className="text-xs px-2 py-1 bg-stone-100 text-stone-500 rounded-full border border-stone-200">
               {currentStyle.label}
             </span>
           )}
        </div>
        
        <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
          <button
            onClick={() => setViewMode('stacked')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'stacked' 
                ? 'bg-white text-stone-900 shadow-sm' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
            title="阅读视图 (堆叠)"
          >
            <Rows size={16} />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'split' 
                ? 'bg-white text-stone-900 shadow-sm' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
            title="比对视图 (双栏)"
          >
            <Columns size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {viewMode === 'stacked' ? (
            // STACKED VIEW
            <>
              {/* Source Text Card */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-stone-400 uppercase tracking-wider text-xs font-semibold">
                  <Quote size={12} /> 原文
                </div>
                <p className="font-serif text-lg leading-relaxed text-stone-600 italic whitespace-pre-wrap">
                  {result.originalText}
                </p>
              </div>

              {/* Translation Card */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-md ring-1 ring-stone-900/5">
                <div className="flex items-center gap-2 mb-4 text-stone-900 uppercase tracking-wider text-xs font-bold">
                  <Book size={12} /> 译文
                </div>
                <div className="font-serif text-xl leading-loose text-stone-900 whitespace-pre-wrap">
                  {result.translatedText}
                </div>
              </div>
            </>
          ) : (
            // SPLIT VIEW (Bilingual Comparison)
            <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden flex flex-col md:flex-row min-h-[500px]">
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-stone-100 bg-stone-50/50">
                 <div className="flex items-center gap-2 mb-3 text-stone-400 uppercase tracking-wider text-xs font-semibold sticky top-0">
                  <Quote size={12} /> 原文
                </div>
                <p className="font-serif text-base leading-relaxed text-stone-600 italic whitespace-pre-wrap">
                  {result.originalText}
                </p>
              </div>
              <div className="flex-1 p-6 bg-white">
                <div className="flex items-center gap-2 mb-3 text-stone-900 uppercase tracking-wider text-xs font-bold sticky top-0">
                  <Book size={12} /> 译文
                </div>
                <div className="font-serif text-base leading-relaxed text-stone-900 whitespace-pre-wrap">
                  {result.translatedText}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Analysis Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Context Note */}
          <div className="bg-stone-100 p-5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2 mb-3 text-stone-600 font-semibold text-sm">
              <Info size={16} /> 背景与语境
            </div>
            <p className="text-sm text-stone-700 leading-relaxed text-justify">
              {result.contextNote}
            </p>
          </div>

          {/* Terminology List */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900 mb-4 pb-2 border-b border-stone-100">
              关键术语解析
            </h3>
            
            {result.terms.length > 0 ? (
              <div className="space-y-4">
                {result.terms.map((term: Term, index) => (
                  <div key={index} className="group">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-medium text-stone-900 text-sm">{term.translation}</span>
                      <span className="text-xs text-stone-500 font-serif italic">{term.original}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-snug">
                      {term.definition}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">未识别到特定术语。</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
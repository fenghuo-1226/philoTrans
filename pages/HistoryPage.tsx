import React, { useEffect, useState } from 'react';
import { getHistory, deleteHistoryItem, clearHistory } from '../services/storageService';
import { HistoryItem } from '../types';
import { Trash2, Calendar, ArrowRight } from 'lucide-react';
import { ResultView } from '../components/ResultView';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleClearAll = () => {
    if (confirm("确定要清空所有历史记录吗？")) {
      clearHistory();
      setHistory([]);
      setSelectedItem(null);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-medium text-stone-900">
          翻译历史
        </h2>
        {history.length > 0 && !selectedItem && (
          <button 
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            清空所有
          </button>
        )}
        {selectedItem && (
          <button 
            onClick={() => setSelectedItem(null)}
            className="text-sm text-stone-600 hover:text-stone-900 font-medium"
          >
            返回列表
          </button>
        )}
      </div>

      {selectedItem ? (
        <div>
           <ResultView result={selectedItem} />
        </div>
      ) : (
        <div className="grid gap-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-stone-200 border-dashed">
              <p className="text-stone-400">暂无历史记录。</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                    <Calendar size={12} />
                    {new Date(item.timestamp).toLocaleDateString('zh-CN')}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-stone-400 mb-1">原文</h4>
                    <p className="text-stone-600 font-serif line-clamp-2 text-sm leading-relaxed">
                      {item.originalText}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-stone-400 mb-1">译文</h4>
                    <p className="text-stone-900 font-serif line-clamp-2 text-sm leading-relaxed">
                      {item.translatedText}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-50 flex justify-end">
                   <span className="text-xs font-medium text-stone-400 group-hover:text-stone-800 transition-colors flex items-center gap-1">
                     查看详情 <ArrowRight size={12} />
                   </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
};
import React from 'react';
import { BookOpen, History, Settings } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'history';
  onNavigate: (page: 'home' | 'history') => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="bg-stone-900 text-white p-1.5 rounded-md group-hover:bg-stone-700 transition-colors">
            <BookOpen size={20} />
          </div>
          <h1 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
            PhiloTrans <span className="text-sm font-normal opacity-80 ml-1 hidden sm:inline">哲学翻译</span>
          </h1>
        </div>

        <nav>
          <ul className="flex items-center gap-1">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'home' 
                    ? 'bg-stone-200 text-stone-900' 
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                创作
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentPage === 'history' 
                    ? 'bg-stone-200 text-stone-900' 
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <History size={16} />
                <span className="hidden sm:inline">历史</span>
              </button>
            </li>
            <li>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="设置"
              >
                <Settings size={20} />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
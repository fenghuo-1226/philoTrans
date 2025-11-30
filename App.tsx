import React, { useState } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsModal } from './components/SettingsModal';

type Page = 'home' | 'history';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <Header 
        currentPage={page} 
        onNavigate={setPage} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <div className="flex-1">
        {page === 'home' && <Home />}
        {page === 'history' && <HistoryPage />}
      </div>
      
      <footer className="py-6 border-t border-stone-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-stone-400 text-sm">
          <p>© {new Date().getFullYear()} PhiloTrans. 学术哲学翻译工具。</p>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default App;
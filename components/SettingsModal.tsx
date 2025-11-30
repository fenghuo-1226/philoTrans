import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { getSettings, saveSettings } from '../services/storageService';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const settings = getSettings();
      setToken(settings.siliconFlowToken || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings({ siliconFlowToken: token.trim() });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h3 className="font-serif text-lg font-bold text-stone-900">设置</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              SiliconFlow API Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none text-sm font-mono"
            />
            <p className="mt-2 text-xs text-stone-500">
              用于语音转文本服务。请在 <a href="https://cloud.siliconflow.cn" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">SiliconFlow</a> 获取 API 密钥。
            </p>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isSaved 
                ? 'bg-green-600 text-white' 
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {isSaved ? '已保存' : <><Save size={16} /> 保存设置</>}
          </button>
        </div>
      </div>
    </div>
  );
};
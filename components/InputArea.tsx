import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Book, Notebook, Users, Sparkles, ChevronDown, PenTool } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { VoiceRecorder } from './VoiceRecorder';
import { PromptMode, PROMPT_MODES, TranslationStyle, TRANSLATION_STYLES } from '../types';

// Fix for PDF.js ESM import compatibility
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

interface InputAreaProps {
  text: string;
  setText: (text: string) => void;
  onTranslate: (mode: PromptMode, style: TranslationStyle) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ text, setText, onTranslate, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  // State for Mode Selection
  const [selectedMode, setSelectedMode] = useState<PromptMode>('translation');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  
  // State for Style Selection
  const [selectedStyle, setSelectedStyle] = useState<TranslationStyle>('academic');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 20);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }
      
      if (pdf.numPages > 20) {
        fullText += "\n[文档过长，仅截取前20页内容]";
      }
      
      return fullText;
    } catch (error) {
      console.error("PDF Parsing error:", error);
      throw new Error("无法读取 PDF 文件，请确保文件未加密。");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessingFile(true);
    setText("");

    try {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setText(content);
          setIsProcessingFile(false);
        };
        reader.readAsText(file);
      } else if (file.type === "application/pdf") {
        const extractedText = await extractTextFromPDF(file);
        setText(extractedText);
        setIsProcessingFile(false);
      } else {
        alert("目前仅支持 .txt 和 .pdf 文件。");
        setFileName(null);
        setIsProcessingFile(false);
      }
    } catch (error) {
      alert("文件处理失败：" + (error as any).message);
      setFileName(null);
      setIsProcessingFile(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVoiceInput = (transcribedText: string) => {
    setText(text ? text + '\n' + transcribedText : transcribedText);
  };

  const getModeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Book': return <Book size={16} />;
      case 'Notebook': return <Notebook size={16} />;
      case 'Users': return <Users size={16} />;
      case 'Sparkles': return <Sparkles size={16} />;
      default: return <Book size={16} />;
    }
  };

  const currentMode = PROMPT_MODES.find(m => m.id === selectedMode) || PROMPT_MODES[0];
  const currentStyle = TRANSLATION_STYLES.find(s => s.id === selectedStyle) || TRANSLATION_STYLES[0];

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isProcessingFile ? "正在解析文件内容..." : "在此输入、粘贴文本或使用语音录入..."}
          className="w-full h-48 p-4 rounded-xl border border-stone-200 bg-white font-serif text-lg leading-relaxed focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none resize-none shadow-sm transition-shadow disabled:bg-stone-50 disabled:text-stone-400 pb-10"
          disabled={isLoading || isProcessingFile}
        />
        
        {/* Character Count */}
        <div className="absolute bottom-4 right-4 text-xs text-stone-400 font-mono bg-white/80 px-2 py-1 rounded">
          {text.length} 字
        </div>

        {fileName && (
          <div className="absolute bottom-4 left-4 bg-stone-100 border border-stone-200 rounded-lg p-2 flex items-center gap-2 max-w-[calc(100%-100px)]">
             <div className="flex items-center gap-2 text-stone-600 truncate">
               <FileText size={16} />
               <span className="text-sm font-medium truncate">{fileName}</span>
             </div>
             <button onClick={clearFile} className="text-stone-400 hover:text-stone-700 shrink-0">
               <X size={16} />
             </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.pdf"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isProcessingFile}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 transition-colors"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">文件</span>
          </button>

          {/* Voice Input */}
          <VoiceRecorder 
            onTranscriptionComplete={handleVoiceInput} 
            disabled={isLoading || isProcessingFile}
          />
        </div>

        <div className="flex items-center gap-2">
           {/* Mode Selector */}
           <div className="relative">
            <button
              onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
              disabled={isLoading || isProcessingFile}
              className="flex items-center gap-2 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 font-medium text-sm transition-colors border border-transparent hover:border-stone-300"
              title="选择功能模式"
            >
              {getModeIcon(currentMode.icon)}
              <span className="hidden sm:inline">{currentMode.label}</span>
              <ChevronDown size={14} className={`transition-transform ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isModeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsModeDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-stone-100 z-20 py-1 overflow-hidden animate-fade-in">
                  {PROMPT_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setSelectedMode(mode.id);
                        setIsModeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-stone-50 transition-colors ${
                        selectedMode === mode.id ? 'bg-stone-50 text-stone-900 font-medium' : 'text-stone-600'
                      }`}
                    >
                      <span className="text-stone-400">
                        {getModeIcon(mode.icon)}
                      </span>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Style Selector - Only visible for translation mode */}
          {selectedMode === 'translation' && (
            <div className="relative">
              <button
                onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                disabled={isLoading || isProcessingFile}
                className="flex items-center gap-2 px-3 py-2 bg-white text-stone-700 rounded-lg hover:bg-stone-50 font-medium text-sm transition-colors border border-stone-200"
                title="选择翻译风格"
              >
                <PenTool size={16} className="text-stone-500" />
                <span className="hidden sm:inline">{currentStyle.label}</span>
                <ChevronDown size={14} className={`transition-transform ${isStyleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isStyleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsStyleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-100 z-20 py-1 overflow-hidden animate-fade-in">
                    {TRANSLATION_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style.id);
                          setIsStyleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm block hover:bg-stone-50 transition-colors ${
                          selectedStyle === style.id ? 'bg-stone-50 text-stone-900 font-medium' : 'text-stone-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                           <span>{style.label}</span>
                        </div>
                        <div className="text-xs text-stone-400">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => onTranslate(selectedMode, selectedStyle)}
            disabled={!text.trim() || isLoading || isProcessingFile}
            className="px-6 py-2 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                处理中...
              </>
            ) : (
              "生成"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
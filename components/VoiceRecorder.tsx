import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { getSettings } from '../services/storageService';
import { transcribeAudio } from '../services/asrService';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  disabled: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | undefined>(undefined);

  const startRecording = async () => {
    const settings = getSettings();
    if (!settings.siliconFlowToken) {
      alert("请先在右上角设置中配置 SiliconFlow API Token 以使用语音功能。");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Microphone access error:", error);
      alert("无法访问麦克风，请检查浏览器权限。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const settings = getSettings();
      const text = await transcribeAudio(blob, settings.siliconFlowToken);
      onTranscriptionComplete(text);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isTranscribing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-stone-500 bg-stone-100 rounded-lg text-sm">
        <Loader2 size={16} className="animate-spin" />
        <span>语音转写中...</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <button
        onClick={stopRecording}
        className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors animate-pulse"
      >
        <Square size={16} fill="currentColor" />
        <span className="text-sm font-mono w-10">{formatTime(duration)}</span>
      </button>
    );
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      className="flex items-center gap-2 px-3 py-2 text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:text-stone-900 disabled:opacity-50 transition-colors"
      title="语音输入 (需配置 API Token)"
    >
      <Mic size={18} />
      <span className="hidden sm:inline text-sm font-medium">语音输入</span>
    </button>
  );
};
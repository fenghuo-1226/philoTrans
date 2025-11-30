interface TranscriptionResponse {
  text: string;
  code?: number;
  message?: string;
}

export const transcribeAudio = async (audioBlob: Blob, token: string): Promise<string> => {
  if (!token) {
    throw new Error("请先在设置中配置 SiliconFlow API Token");
  }

  const formData = new FormData();
  // Ensure the file has a name and extension, required by some APIs
  formData.append('file', audioBlob, 'recording.webm'); 
  formData.append('model', 'TeleAI/TeleSpeechASR');

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Do not set Content-Type header manually when using FormData, 
        // the browser will set it with the boundary.
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `请求失败: ${response.status}`);
    }

    const data: TranscriptionResponse = await response.json();
    
    if (!data.text) {
      throw new Error("未识别到文本内容");
    }

    return data.text;
  } catch (error: any) {
    console.error("ASR Error:", error);
    throw new Error(error.message || "语音转写失败");
  }
};
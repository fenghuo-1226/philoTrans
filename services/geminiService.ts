import { TranslationResult, PromptMode, TranslationStyle } from "../types";
import { getSettings } from "./storageService";

const getSystemInstruction = (mode: PromptMode, style: TranslationStyle = 'academic') => {
  const baseSchema = `重要：你必须只返回有效的 JSON 对象，不要包含任何 Markdown 代码块标记（如 \`\`\`json 或 \`\`\`），不要包含任何额外的文字说明，只返回纯 JSON。

输出格式必须严格符合以下 JSON 结构：
{
  "translatedText": "处理后的文本",
  "terms": [
    {
      "original": "原文词汇",
      "translation": "译名或解释",
      "definition": "学术定义或上下文解释"
    }
  ],
  "contextNote": "背景说明或摘要"
}`;
  
  // 针对不同风格的翻译指令
  const styleInstruction = {
    academic: "保持极高的学术严谨性。忠实保留特定哲学家的术语细微差别（如海德格尔的 Dasein，康德的 Transcendental），使用标准的学术中文表达。",
    literal: "采用直译策略。最大程度保留原文的句法结构和语序，即使这可能导致中文略显生硬，目的是为了进行语文学（Philological）研究。",
    liberal: "采用意译策略。在不改变原意的前提下，优化句子结构，使其更符合中文母语者的阅读习惯，流畅自然，通俗易懂。"
  };

  switch (mode) {
    case 'note':
      return `你是一位学术助手。你的任务是将用户的语音笔记或草稿整理成结构清晰的学术笔记。
1. **整理文本**：纠正口语错误，将内容重组为逻辑通顺的书面语。
2. **关键词提取**：提取笔记中的核心概念、人名或著作作为"术语"。
3. **摘要总结**：用一段话概括这篇笔记的核心思想作为"语境说明"。
${baseSchema}`;

    case 'polish':
      return `你是一位专业的文字编辑。你的任务是润色用户的灵感记录。
1. **润色文本**：提升文采，使用更优美的表达，但保持原意。
2. **修辞分析**：提取文本中使用的关键意象或关键词作为"术语"。
3. **意图说明**：分析这段文字表达的情感或思想倾向作为"语境说明"。
${baseSchema}`;

    case 'translation':
    default:
      return `你是一位专业的哲学翻译家和导师。你的任务是翻译哲学文本（从英语/德语/法语/希腊语翻译成中文，或者从中文翻译成英文）。
1. **翻译策略**：${styleInstruction[style]}
2. **术语解析**：识别文本中使用的关键哲学概念/术语，并提供解释。
3. **语境说明**：提供简短的"背景与语境"说明，解释历史背景、具体的论点，或该文本所属的哲学传统。
${baseSchema}`;
  }
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
// 尝试不同的模型名称格式
const MODEL_NAME = 'deepseek-ai/DeepSeek-V3';

export const translateText = async (text: string, mode: PromptMode = 'translation', style: TranslationStyle = 'academic'): Promise<Omit<TranslationResult, 'timestamp' | 'originalText'>> => {
  const settings = getSettings();
  const token = settings.siliconFlowToken;

  if (!token) {
    throw new Error("缺少 API 密钥。请在设置中配置 SiliconFlow API Token。");
  }

  const systemInstruction = getSystemInstruction(mode, style);

  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const requestBody = {
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: systemInstruction
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      };

      console.log('Sending request to SiliconFlow:', {
        url: SILICONFLOW_API_URL,
        model: MODEL_NAME,
        textLength: text.length
      });

      const response = await fetch(SILICONFLOW_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() || `HTTP ${response.status}` };
        }
        
        const error = new Error(errorData.message || errorData.error?.message || `请求失败: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        (error as any).response = errorData;
        throw error;
      }

      const data = await response.json();
      
      console.log('Full API response:', JSON.stringify(data, null, 2));
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid response structure:', data);
        throw new Error("未收到有效的响应。响应结构不正确。");
      }

      let jsonText = data.choices[0].message.content;
      if (!jsonText) {
        console.error('Empty content in response:', data);
        throw new Error("未收到响应内容。");
      }

      // 检查内容是否为有效文本（不是二进制数据）
      if (typeof jsonText !== 'string') {
        console.error('Content is not a string:', typeof jsonText, jsonText);
        throw new Error("响应内容格式不正确，不是文本格式。");
      }

      // 检查是否包含不可打印字符（可能是二进制数据）
      if (/[\x00-\x08\x0E-\x1F]/.test(jsonText)) {
        console.error('Content contains binary data detected');
        throw new Error("响应内容包含无效字符，可能是编码问题。");
      }

      // 清理可能的 Markdown 代码块标记
      jsonText = jsonText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      }
      jsonText = jsonText.trim();

      console.log('Raw JSON text from API (first 500 chars):', jsonText.substring(0, 500) + (jsonText.length > 500 ? '...' : ''));
      console.log('JSON text length:', jsonText.length);

      let parsedData;
      try {
        parsedData = JSON.parse(jsonText);
      } catch (parseError: any) {
        console.error('JSON parse error. Raw content:', jsonText);
        console.error('Parse error details:', parseError);
        throw new Error(`JSON 解析失败: ${parseError.message}。API 返回的内容可能格式不正确。`);
      }
      
      // 验证返回的数据结构
      if (!parsedData.translatedText) {
        throw new Error("响应格式不正确：缺少 translatedText 字段");
      }
      
      return {
        translatedText: parsedData.translatedText,
        terms: parsedData.terms || [],
        contextNote: parsedData.contextNote || "暂无说明。",
        mode: mode,
        style: style
      };

    } catch (error: any) {
      // 记录详细的错误信息
      const errorDetails = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response,
        stack: error.stack
      };
      console.error(`SiliconFlow Processing Attempt ${attempt} failed:`, errorDetails);
      console.error('Full error object:', error);
      lastError = error;

      const isRetryable = 
        error.status === 500 || 
        error.status === 503 || 
        (error.message && (
          error.message.includes('fetch failed') ||
          error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('Failed to fetch')
        ));

      if (attempt < MAX_RETRIES && isRetryable) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break;
    }
  }

  const errorMessage = lastError?.message || JSON.stringify(lastError);
  throw new Error(`处理请求失败 (${errorMessage})。请检查网络连接或文本长度后重试。`);
};
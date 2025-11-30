import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TranslationResult, PromptMode, TranslationStyle } from "../types";

const getSystemInstruction = (mode: PromptMode, style: TranslationStyle = 'academic') => {
  const baseSchema = `输出必须是符合请求模式的有效 JSON 对象。`;
  
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
2. **关键词提取**：提取笔记中的核心概念、人名或著作作为“术语”。
3. **摘要总结**：用一段话概括这篇笔记的核心思想作为“语境说明”。
${baseSchema}`;
    
    case 'meeting':
      return `你是一位会议记录专员。你的任务是整理会议或对话录音文本。
1. **纪要整理**：将对话整理为清晰的记录，保留核心观点。
2. **重点标记**：提取会议中的关键决策、行动项或专有名词作为“术语”。
3. **会议概览**：总结会议的主题和背景作为“语境说明”。
${baseSchema}`;

    case 'polish':
      return `你是一位专业的文字编辑。你的任务是润色用户的灵感记录。
1. **润色文本**：提升文采，使用更优美的表达，但保持原意。
2. **修辞分析**：提取文本中使用的关键意象或关键词作为“术语”。
3. **意图说明**：分析这段文字表达的情感或思想倾向作为“语境说明”。
${baseSchema}`;

    case 'translation':
    default:
      return `你是一位专业的哲学翻译家和导师。你的任务是翻译哲学文本（从英语/德语/法语/希腊语翻译成中文，或者从中文翻译成英文）。
1. **翻译策略**：${styleInstruction[style]}
2. **术语解析**：识别文本中使用的关键哲学概念/术语，并提供解释。
3. **语境说明**：提供简短的“背景与语境”说明，解释历史背景、具体的论点，或该文本所属的哲学传统。
${baseSchema}`;
  }
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    translatedText: {
      type: Type.STRING,
      description: "处理后的文本（翻译结果、整理后的笔记或润色后的文字）。",
    },
    terms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "原文词汇或提取的关键词" },
          translation: { type: Type.STRING, description: "译名或关键词解释" },
          definition: { type: Type.STRING, description: "学术定义或上下文解释（请使用中文）。" },
        },
        required: ["original", "translation", "definition"],
      },
    },
    contextNote: {
      type: Type.STRING,
      description: "背景说明、摘要总结或意图分析（请使用中文）。",
    },
  },
  required: ["translatedText", "terms", "contextNote"],
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const translateText = async (text: string, mode: PromptMode = 'translation', style: TranslationStyle = 'academic'): Promise<Omit<TranslationResult, 'timestamp' | 'originalText'>> => {
  if (!process.env.API_KEY) {
    throw new Error("缺少 API 密钥。请检查环境变量。");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
          systemInstruction: getSystemInstruction(mode, style),
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.3,
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error("未收到 Gemini 的响应。");
      }

      const parsedData = JSON.parse(jsonText);
      
      return {
        translatedText: parsedData.translatedText,
        terms: parsedData.terms || [],
        contextNote: parsedData.contextNote || "暂无说明。",
        mode: mode,
        style: style
      };

    } catch (error: any) {
      console.error(`Gemini Processing Attempt ${attempt} failed:`, error);
      lastError = error;

      const isRetryable = 
        error.status === 500 || 
        error.status === 503 || 
        (error.message && (
          error.message.includes('xhr error') || 
          error.message.includes('fetch failed') ||
          error.message.includes('Rpc failed')
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
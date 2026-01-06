/**
 * AI Service
 * ===========
 * Unified AI interface supporting multiple providers.
 * Falls back to local logic when external APIs unavailable.
 */

export type AIProvider = 'chatgpt' | 'gemini' | 'sonnet' | 'local';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  provider: AIProvider;
  error?: string;
}

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// Default configuration
const defaultConfig: AIConfig = {
  provider: 'local',
  maxTokens: 1000,
  temperature: 0.7,
};

// Current active configuration
let currentConfig: AIConfig = { ...defaultConfig };

/**
 * Set AI configuration
 */
export const setAIConfig = (config: Partial<AIConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
};

/**
 * Get current AI configuration
 */
export const getAIConfig = (): AIConfig => ({ ...currentConfig });

/**
 * Check if external AI is available
 */
const isExternalAIAvailable = (): boolean => {
  return !!(
    currentConfig.apiKey &&
    currentConfig.provider !== 'local'
  );
};

/**
 * Local AI fallback - simple pattern-based responses
 */
const localAIResponse = (messages: AIMessage[]): AIResponse => {
  const lastMessage = messages[messages.length - 1];
  const userInput = lastMessage?.content?.toLowerCase() || '';
  
  // Simple pattern matching for common queries
  let response = '';
  
  if (userInput.includes('hello') || userInput.includes('مرحبا') || userInput.includes('hi')) {
    response = 'مرحباً! كيف يمكنني مساعدتك اليوم؟';
  } else if (userInput.includes('help') || userInput.includes('مساعدة')) {
    response = 'أنا هنا لمساعدتك! يمكنني مساعدتك في إنشاء المشاريع، الإجابة على الأسئلة، وتقديم اقتراحات.';
  } else if (userInput.includes('project') || userInput.includes('مشروع')) {
    response = 'يمكنك إنشاء مشروع جديد من لوحة التحكم. اختر نوع المشروع وأدخل التفاصيل المطلوبة.';
  } else if (userInput.includes('code') || userInput.includes('كود')) {
    response = 'أستطيع مساعدتك في كتابة الأكواد. ما هي اللغة أو الإطار الذي تريد استخدامه؟';
  } else {
    response = 'شكراً على رسالتك! هذا وضع المعاينة المحلية. للحصول على ردود ذكاء اصطناعي كاملة، يرجى تكوين مفتاح API.';
  }
  
  return {
    success: true,
    message: response,
    provider: 'local',
  };
};

/**
 * Send message to ChatGPT (placeholder)
 */
const sendToChatGPT = async (messages: AIMessage[]): Promise<AIResponse> => {
  // Placeholder - would integrate with OpenAI API
  console.log('[AI] ChatGPT request (placeholder):', messages);
  
  return {
    success: false,
    message: '',
    provider: 'chatgpt',
    error: 'ChatGPT integration not configured. Using local fallback.',
  };
};

/**
 * Send message to Gemini (placeholder)
 */
const sendToGemini = async (messages: AIMessage[]): Promise<AIResponse> => {
  // Placeholder - would integrate with Google Gemini API
  console.log('[AI] Gemini request (placeholder):', messages);
  
  return {
    success: false,
    message: '',
    provider: 'gemini',
    error: 'Gemini integration not configured. Using local fallback.',
  };
};

/**
 * Send message to Claude/Sonnet (placeholder)
 */
const sendToSonnet = async (messages: AIMessage[]): Promise<AIResponse> => {
  // Placeholder - would integrate with Anthropic API
  console.log('[AI] Sonnet request (placeholder):', messages);
  
  return {
    success: false,
    message: '',
    provider: 'sonnet',
    error: 'Sonnet integration not configured. Using local fallback.',
  };
};

/**
 * Send message to AI with automatic fallback
 */
export const sendMessage = async (messages: AIMessage[]): Promise<AIResponse> => {
  // Try external AI first if configured
  if (isExternalAIAvailable()) {
    try {
      let response: AIResponse;
      
      switch (currentConfig.provider) {
        case 'chatgpt':
          response = await sendToChatGPT(messages);
          break;
        case 'gemini':
          response = await sendToGemini(messages);
          break;
        case 'sonnet':
          response = await sendToSonnet(messages);
          break;
        default:
          response = localAIResponse(messages);
      }
      
      // If external AI succeeded, return response
      if (response.success) {
        return response;
      }
      
      // Fall back to local
      console.warn(`[AI] ${currentConfig.provider} failed, falling back to local`);
    } catch (error) {
      console.error('[AI] External AI error:', error);
    }
  }
  
  // Use local AI as fallback
  return localAIResponse(messages);
};

/**
 * Quick AI query helper
 */
export const askAI = async (question: string): Promise<string> => {
  const response = await sendMessage([
    { role: 'user', content: question }
  ]);
  
  return response.message;
};

/**
 * Generate code suggestion (placeholder)
 */
export const generateCode = async (
  description: string,
  language: string = 'typescript'
): Promise<AIResponse> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are a code generator. Generate ${language} code based on the description.`,
    },
    {
      role: 'user',
      content: description,
    },
  ];
  
  return sendMessage(messages);
};

/**
 * Get AI provider status
 */
export const getAIStatus = () => ({
  currentProvider: currentConfig.provider,
  isExternalAvailable: isExternalAIAvailable(),
  supportedProviders: ['chatgpt', 'gemini', 'sonnet', 'local'] as AIProvider[],
});

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

/**
 * Base AI Provider class to be extended by concrete providers.
 */
class AIProvider {
  constructor(name, priority) {
    this.name = name;
    this.priority = priority; // Lower values = higher priority
  }

  isConfigured() {
    throw new Error(`isConfigured() not implemented for ${this.name}`);
  }

  async generate(messages, systemInstruction) {
    throw new Error(`generate() not implemented for ${this.name}`);
  }
}

/**
 * Gemini AI Provider (Primary)
 */
class GeminiProvider extends AIProvider {
  constructor() {
    super('Gemini', 1);
  }

  isConfigured() {
    return !!config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here';
  }

  async generate(messages, systemInstruction) {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    
    // Default model: gemini-2.5-flash (since 1.5-flash is retired/deprecated)
    const modelOptions = { model: 'gemini-2.5-flash' };
    if (systemInstruction) {
      modelOptions.systemInstruction = systemInstruction;
    }
    
    const model = genAI.getGenerativeModel(modelOptions);

    // Format messages for Gemini API
    // Gemini expects: contents = [ { role: 'user'|'model', parts: [ { text: string } ] } ]
    let contents = [];
    
    if (typeof messages === 'string') {
      contents.push({
        role: 'user',
        parts: [{ text: messages }]
      });
    } else if (Array.isArray(messages)) {
      contents = messages
        .filter(m => m.role !== 'system') // System instructions should be passed in modelOptions
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));
    }

    if (contents.length === 0) {
      throw new Error('No messages provided for generation');
    }

    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    return text;
  }
}

/**
 * OpenRouter AI Provider (Fallback, dynamically acts as Groq if a Groq key is supplied)
 */
class OpenRouterProvider extends AIProvider {
  constructor() {
    super('OpenRouter', 2);
    // Standard high-quality fallback: DeepSeek V3 or Qwen
    this.modelName = 'deepseek/deepseek-chat'; 
  }

  isConfigured() {
    return !!config.openrouterApiKey && config.openrouterApiKey !== 'your_openrouter_api_key_here';
  }

  async generate(messages, systemInstruction) {
    const isGroqKey = config.openrouterApiKey.startsWith('gsk_');
    const url = isGroqKey 
      ? 'https://api.groq.com/openai/v1/chat/completions' 
      : 'https://openrouter.ai/api/v1/chat/completions';
    
    const model = isGroqKey ? 'llama-3.3-70b-versatile' : this.modelName;
    
    let formattedMessages = [];
    if (systemInstruction) {
      formattedMessages.push({ role: 'system', content: systemInstruction });
    }

    if (typeof messages === 'string') {
      formattedMessages.push({ role: 'user', content: messages });
    } else if (Array.isArray(messages)) {
      messages.forEach(m => {
        formattedMessages.push({
          role: m.role === 'system' ? 'system' : (m.role === 'user' ? 'user' : 'assistant'),
          content: m.content
        });
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openrouterApiKey}`
    };

    if (!isGroqKey) {
      headers['HTTP-Referer'] = 'http://localhost:5001';
      headers['X-Title'] = 'StudyBuddy University App';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    const providerName = isGroqKey ? 'Groq' : 'OpenRouter';

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`${providerName} API error (HTTP ${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    throw new Error(`Unexpected response format from ${providerName}`);
  }
}

/**
 * Orchestrates AI requests across registered providers with priority and failover.
 */
class AIService {
  constructor() {
    this.providers = [];
    // Register default providers
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new OpenRouterProvider());
  }

  /**
   * Registers a new provider and sorts the list by priority.
   */
  registerProvider(provider) {
    this.providers.push(provider);
    // Sort ascending by priority (1 is highest)
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Main entry point to generate response with automatic failover.
   */
  async generateResponse(messages, systemInstruction = '') {
    let lastError = null;

    // Filter to only enabled and configured providers
    const activeProviders = this.providers.filter(p => p.isConfigured());

    if (activeProviders.length === 0) {
      throw new Error('No AI providers configured in the system. Check your .env file.');
    }

    for (const provider of activeProviders) {
      try {
        const resolvedName = provider.name === 'OpenRouter' && config.openrouterApiKey.startsWith('gsk_') ? 'Groq' : provider.name;
        console.log(`[AI Service] Attempting request using provider: ${resolvedName}...`);
        const text = await provider.generate(messages, systemInstruction);
        
        // Log which provider handled the request (Req #4)
        console.log(`[AI Service] Request successfully handled by provider: [${resolvedName}]`);
        
        return {
          text,
          provider: resolvedName
        };
      } catch (error) {
        const resolvedName = provider.name === 'OpenRouter' && config.openrouterApiKey.startsWith('gsk_') ? 'Groq' : provider.name;
        console.warn(`[AI Service] Provider [${resolvedName}] failed: ${error.message}`);
        lastError = error;
        
        // Check if there's another provider to fall back to
        const currentIndex = activeProviders.indexOf(provider);
        if (currentIndex < activeProviders.length - 1) {
          const nextProvider = activeProviders[currentIndex + 1];
          const nextResolvedName = nextProvider.name === 'OpenRouter' && config.openrouterApiKey.startsWith('gsk_') ? 'Groq' : nextProvider.name;
          console.warn(`[AI Service] Switching to fallback provider: [${nextResolvedName}]`);
        }
      }
    }

    throw new Error(`All configured AI providers failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
  }

}

// Export singleton instance of AIService
module.exports = new AIService();

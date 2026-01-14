import { wrapLanguageModel, customProvider, extractReasoningMiddleware, gateway } from 'ai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';



const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

const middlewareWithStartWithReasoning = extractReasoningMiddleware({
  tagName: 'think',
  startWithReasoning: true,
});

const pedagogistspte = customProvider({
  languageModels: {
    'pedagogistspte_defult': google('gemini-1.5-pro-latest'),
  },
});
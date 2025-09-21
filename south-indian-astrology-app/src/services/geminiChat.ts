// Gemini Chat Service for Astrology Chart Analysis

import { GoogleGenAI } from "@google/genai";
import type { ApiResponse, SouthIndianChartData } from '../types/astrology';

// Initialize Gemini AI with API key  
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

// Interface for chat messages
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isAudio?: boolean;
}

// Interface for chat session
export interface ChatSession {
  messages: ChatMessage[];
  chartContext?: ApiResponse;
}

// Create system prompt for astrology chart analysis
function createAstrologySystemPrompt(chartData?: ApiResponse): string {
  if (!chartData) {
    return `You are an expert Vedic astrologer specializing in South Indian astrology chart interpretation. 
    You provide insightful, accurate, and helpful guidance based on astrological principles. 
    Answer questions about astrology, planetary positions, houses, and chart interpretations.
    Keep responses clear, informative, and relevant to Vedic astrology.`;
  }

  const natalDate = chartData.other_details.natal_date_formatted;
  const transitDate = chartData.other_details.transit_date_formatted;
  const ayanamsha = chartData.other_details.natal_ayanamsha_name;
  const houseSystem = chartData.other_details.natal_house_system_used;

  // Extract planetary positions for context
  const planetPositions = Object.entries(chartData.natal_planets)
    .map(([planet, longitude]) => {
      const sign = Math.floor(longitude / 30);
      const degree = longitude % 30;
      const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      return `${planet}: ${signNames[sign]} ${degree.toFixed(2)}°`;
    }).join(', ');

  return `You are an expert Vedic astrologer specializing in South Indian astrology chart interpretation.
  
  CURRENT CHART CONTEXT:
  - Birth Date: ${natalDate}
  - Current Transit Date: ${transitDate}
  - Ayanamsha: ${ayanamsha}
  - House System: ${houseSystem}
  - Natal Planetary Positions: ${planetPositions}
  
  Based on this specific chart data, provide personalized astrological guidance and interpretations.
  Answer questions about:
  - Planetary positions and their meanings
  - House interpretations 
  - Current transits and their effects
  - Compatibility and relationships
  - Career and life path guidance
  - Timing of events (muhurta)
  - Remedies and suggestions
  
  Keep responses accurate, insightful, and specific to this person's chart.
  Use Vedic astrology principles and South Indian chart conventions.`;
}

class GeminiChatService {
  private model = ai.models.generateContent;
  private conversationHistory: ChatMessage[] = [];

  // Generate chat response
  async generateResponse(
    userMessage: string, 
    chartContext?: ApiResponse,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const systemPrompt = createAstrologySystemPrompt(chartContext);
      
      // Build conversation context
      const conversationContext = conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationContext}

Current user question: ${userMessage}

Please provide a helpful and accurate astrological response:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
      });

      return response.text || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      throw new Error('Failed to generate astrological response. Please check your connection and try again.');
    }
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.trim() !== '');
  }

  // Generate unique message ID
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create user message
  createUserMessage(content: string, isAudio: boolean = false): ChatMessage {
    return {
      id: this.generateMessageId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      isAudio
    };
  }

  // Create assistant message
  createAssistantMessage(content: string): ChatMessage {
    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content,
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const geminiChatService = new GeminiChatService();
export default geminiChatService;
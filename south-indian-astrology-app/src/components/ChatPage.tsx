// Chat Page Component for Astrology Chart Consultation

import React, { useState, useRef, useEffect } from 'react';
import { geminiChatService, type ChatMessage, type ChatSession } from '../services/geminiChat';
import type { ApiResponse } from '../types/astrology';
import './ChatPage.css';

interface ChatPageProps {
  chartData?: ApiResponse | null;
  onNavigateBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ chartData, onNavigateBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = geminiChatService.createAssistantMessage(
        chartData 
          ? "Welcome! I'm your Vedic astrology consultant. I have access to your chart data and can answer questions about your planetary positions, houses, current transits, and provide personalized guidance. What would you like to know about your chart?"
          : "Welcome! I'm your Vedic astrology consultant. To provide personalized guidance, please generate your chart first from the main page. You can still ask general astrology questions!"
      );
      setMessages([welcomeMessage]);
    }
  }, [chartData, messages.length]);

  // Send text message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!geminiChatService.isConfigured()) {
      setError('Gemini API is not configured. Please check your settings.');
      return;
    }

    const userMessage = geminiChatService.createUserMessage(inputMessage);
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await geminiChatService.generateResponse(
        userMessage.content,
        chartData || undefined,
        messages
      );

      const assistantMessage = geminiChatService.createAssistantMessage(response);
      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio input (Speech-to-Text using Web Speech API)
  const processAudioInput = async (audioBlob: Blob) => {
    try {
      // Note: For production, you'd want to use a more robust speech-to-text service
      // For now, we'll use browser's Web Speech API as a fallback
      setError('Audio processing... Please use text input for now or implement speech-to-text service.');
    } catch (err) {
      setError('Failed to process audio input');
    }
  };

  // Text-to-speech for assistant responses
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speech
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setError('');
    // Re-initialize with welcome message
    setTimeout(() => {
      const welcomeMessage = geminiChatService.createAssistantMessage(
        chartData 
          ? "Chat cleared! I still have access to your chart data. What would you like to know about your astrology chart?"
          : "Chat cleared! How can I help you with astrology today?"
      );
      setMessages([welcomeMessage]);
    }, 100);
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button className="back-button" onClick={onNavigateBack}>
          ← Back to Charts
        </button>
        <h1>Astrology Chat Consultant</h1>
        <div className="chat-controls">
          <button className="clear-chat-button" onClick={clearChat}>
            🗑️ Clear
          </button>
          {chartData && (
            <span className="chart-status">📊 Chart Loaded</span>
          )}
        </div>
      </header>

      <main className="chat-main">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                {message.content}
                {message.isAudio && <span className="audio-indicator">🎤</span>}
              </div>
              {message.role === 'assistant' && (
                <div className="message-actions">
                  <button
                    className="speak-button"
                    onClick={() => speakMessage(message.content)}
                    disabled={isSpeaking}
                  >
                    🔊
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant-message loading">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Consulting the stars...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isSpeaking && (
          <div className="speaking-indicator">
            <button className="stop-speaking-button" onClick={stopSpeaking}>
              🔇 Stop Speaking
            </button>
          </div>
        )}

        <div className="input-container">
          <div className="input-row">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chartData 
                  ? "Ask about your chart: planetary positions, predictions, guidance..."
                  : "Ask general astrology questions (generate chart for personalized guidance)..."
              }
              className="message-input"
              rows={2}
              disabled={isLoading}
            />
            <div className="input-buttons">
              <button
                className={`voice-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                {isRecording ? '⏹️' : '🎤'}
              </button>
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                📤
              </button>
            </div>
          </div>
          
          {!chartData && (
            <div className="chart-prompt">
              💡 For personalized chart readings, please generate your chart from the main page first!
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
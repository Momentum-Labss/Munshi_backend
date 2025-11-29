// contexts/MunshiContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { Message, MunshiContextType } from "../types";

export const MunshiContext = createContext<MunshiContextType | undefined>(
  undefined
);

const CHAT_STORAGE_KEY = "@munshi_chat_history";

// Mock AI responses for different intents
const mockResponses: Record<string, string[]> = {
  greeting: [
    "Namaste! How can I help you today?",
    "Hello! I'm Munshi, your business assistant. What would you like to do?",
    "Hi there! Ready to help with your shop management.",
  ],
  sales: [
    "I can help you record a sale. Just tell me the amount and payment method.",
    "Would you like to see today's sales summary or record a new sale?",
    "Your sales are looking good! What would you like to record?",
  ],
  stock: [
    "I can help you check or update your inventory. What item are you looking for?",
    "Let me help you with stock management. Which product do you want to check?",
    "I'll help you track your inventory. What do you need?",
  ],
  udhaar: [
    "I can help you manage credit. Want to add new udhaar or check pending amounts?",
    "Let me help with credit management. Who do you want to record udhaar for?",
    "I'll track that credit for you. What's the customer name and amount?",
  ],
  default: [
    "I understand. Let me help you with that.",
    "Sure, I can assist with that. Tell me more.",
    "Got it! What else would you like me to help with?",
  ],
};

const getAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("namaste")) {
    return mockResponses.greeting[Math.floor(Math.random() * mockResponses.greeting.length)];
  }
  if (lowerMessage.includes("sale") || lowerMessage.includes("sell") || lowerMessage.includes("sold")) {
    return mockResponses.sales[Math.floor(Math.random() * mockResponses.sales.length)];
  }
  if (lowerMessage.includes("stock") || lowerMessage.includes("inventory") || lowerMessage.includes("item")) {
    return mockResponses.stock[Math.floor(Math.random() * mockResponses.stock.length)];
  }
  if (lowerMessage.includes("udhaar") || lowerMessage.includes("credit") || lowerMessage.includes("loan")) {
    return mockResponses.udhaar[Math.floor(Math.random() * mockResponses.udhaar.length)];
  }

  return mockResponses.default[Math.floor(Math.random() * mockResponses.default.length)];
};

export const MunshiProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const savedChat = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const saveChatHistory = async () => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: getAIResponse(content),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1000 + Math.random() * 500); // 1-1.5s delay for realism
  };

  const clearChat = async () => {
    setMessages([]);
    try {
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  const handleSetListening = (listening: boolean) => {
    setIsListening(listening);
  };

  return (
    <MunshiContext.Provider
      value={{
        messages,
        isListening,
        isProcessing,
        sendMessage,
        clearChat,
        setListening: handleSetListening,
      }}
    >
      {children}
    </MunshiContext.Provider>
  );
};

// Sale types
export type SaleMethod = "cash" | "upi" | "udhaar";

export interface Sale {
  id: string;
  amount: number;
  time: string; // HH:MM format
  date: Date;
  method: SaleMethod; // defaults to "cash"
  items?: string[]; // Items sold
  timestamp?: Date; // Alternative to time
  customerName?: string; // For udhaar sales
  customerPhone?: string; // For udhaar sales
}

// Udhaar types - credit given to customers (to receive back)
export type UdhaarStatus = "pending" | "paid";

export interface Udhaar {
  id: string;
  personName: string; // Keep for backward compatibility
  customerName?: string; // Customer name
  customerPhone?: string; // Phone number
  amount: number;
  status: UdhaarStatus;
  date: Date;
  paidDate?: Date;
  items?: string[]; // Items purchased
  isPaid?: boolean; // Alternative to status
}

// Stock types
export type StockStatus = "ok" | "low" | "critical";

export interface StockItem {
  id: string;
  name: string;
  currentQuantity: number;
  unit: string; // kg, pcs, liters, packets, etc.
  predictedRefillDate: Date | undefined;
  quantity?: number; // Alternative to currentQuantity
  category?: string; // Product category
  lastRefillDate?: Date; // Last refill date
  refillFrequency?: number; // Days between refills
  price?: number; // Price per unit
}

// User Profile types
export type Language = "English" | "Hindi" | "Hinglish";

export interface UserProfile {
  id?: string;
  name: string;
  number: string;
  address: string;
  preferedLanguage: Language;
}

export interface LanguageOption {
  name: string;
  nativeName: string;
}

// Card common props
export interface CardProps {
  onViewAll?: () => void;
}

// Munshi AI Agent types
export type MessageRole = "user" | "assistant";
export type InputType = "voice" | "text";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  inputType?: InputType;
}

export interface MunshiContextType {
  messages: Message[];
  isListening: boolean;
  isProcessing: boolean;
  sendMessage: (content: string) => void;
  clearChat: () => void;
  setListening: (listening: boolean) => void;
}

// Voice Context types (global voice-first interface)
export interface VoiceContextType {
  messages: Message[];
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  wakeWordEnabled: boolean;
  toggleVoice: () => void;
  stopListening: () => void;
  sendTextMessage: (content: string) => void;
  clearHistory: () => void;
  toggleVoiceEnabled: () => void;
  toggleWakeWord: () => void;
  stopSpeaking: () => void;
  recognizedText: string;
  streamingText?: string;
}

// Export product types
export * from './product';


// contexts/VoiceContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { createContext, ReactNode, useEffect, useState, useRef } from "react";
import { Message, VoiceContextType } from "../types";
import { streamAgentQuery } from "../api/agent";

export const VoiceContext = createContext<VoiceContextType | undefined>(
  undefined
);

const VOICE_HISTORY_KEY = "@munshi_voice_history";

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // Ref to track if a response is currently being streamed
  const isStreamingRef = useRef(false);

  // Load conversation history on mount
  useEffect(() => {
    loadVoiceHistory();
    setupSpeechRecognition();
  }, []);

  // Save conversation history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveVoiceHistory();
    }
  }, [messages]);

  // Listen for speech recognition events - only if available
  useSpeechRecognitionEvent("start", () => {
    if (speechRecognitionAvailable) {
      setIsListening(true);
      setRecognizedText("");
      setFinalTranscript("");
    }
  });

  useSpeechRecognitionEvent("end", () => {
    if (speechRecognitionAvailable) {
      setIsListening(false);
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    if (speechRecognitionAvailable) {
      const result = event.results[0];
      const transcript = result?.transcript;
      
      if (transcript) {
        if (event.isFinal) {
          // If the segment is final, append it to our accumulated transcript
          setFinalTranscript((prev) => {
            const newFinal = prev ? `${prev} ${transcript}` : transcript;
            setRecognizedText(newFinal); // Update visible text immediately
            return newFinal;
          });
        } else {
          // If it's interim, show accumulated + current
          setRecognizedText(finalTranscript ? `${finalTranscript} ${transcript}` : transcript);
        }
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (speechRecognitionAvailable) {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    }
  });

  const setupSpeechRecognition = async () => {
    try {
      // First, try to request permissions
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        console.warn("Speech recognition permission not granted");
        setSpeechRecognitionAvailable(false);
        return;
      }

      // Try to get supported locales with Google service
      try {
        const supported = await ExpoSpeechRecognitionModule.getSupportedLocales({
          androidRecognitionServicePackage: "com.google.android.googlequicksearchbox",
        });
        if (supported && supported.locales && supported.locales.length > 0) {
          setSpeechRecognitionAvailable(true);
          return;
        }
      } catch (googleError) {
      }

      // Fallback: Try default service (no package specified)
      try {
        const defaultSupported = await ExpoSpeechRecognitionModule.getSupportedLocales({});
        if (defaultSupported && defaultSupported.locales && defaultSupported.locales.length > 0) {
          setSpeechRecognitionAvailable(true);
          return;
        }
      } catch (defaultError) {
        console.log("Default speech service not available");
      }

      // If we get here, speech recognition is not available
      console.warn("Speech recognition not supported on this device");
      setSpeechRecognitionAvailable(false);
    } catch (error) {
      console.warn("Speech recognition setup failed:", error);
      setSpeechRecognitionAvailable(false);
    }
  };

  const loadVoiceHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(VOICE_HISTORY_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        const messagesWithDates = parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error("Failed to load voice history:", error);
    }
  };

  const saveVoiceHistory = async () => {
    try {
      await AsyncStorage.setItem(VOICE_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save voice history:", error);
    }
  };

  const startListening = async () => {
    try {
      if (!speechRecognitionAvailable) {
        console.warn("Speech recognition is not available");
        return;
      }

      const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (status !== "granted") {
        console.error("Speech recognition permission not granted");
        return;
      }

      // Get supported locales to find a valid language
      const supported = await ExpoSpeechRecognitionModule.getSupportedLocales({});
      const supportedLocales = supported?.locales || [];
      
      // Try to find English (IN), then English (US), then just use the first available
      let selectedLang = "en-US"; // Default fallback
      
      if (supportedLocales.includes("en-IN")) {
        selectedLang = "en-IN";
      } else if (supportedLocales.includes("en_IN")) {
        selectedLang = "en_IN"; 
      } else if (supportedLocales.includes("en-US")) {
        selectedLang = "en-US";
      } else if (supportedLocales.length > 0) {
        selectedLang = supportedLocales[0];
      }

      // Start recognition
      ExpoSpeechRecognitionModule.start({
        lang: selectedLang,
        interimResults: true,
        maxAlternatives: 1,
        continuous: true, // Keep listening until user stops
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: ["udhaar", "stock", "sale", "munshi"],
      });
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
    }
  };

  const stopListening = async () => {
    try {
      ExpoSpeechRecognitionModule.stop();
      
      // Process the recognized text
      if (recognizedText.trim()) {
        handleMessage(recognizedText, "voice");
        setRecognizedText("");
      }
    } catch (error) {
      console.error("Failed to stop speech recognition:", error);
    }
  };

  const handleMessage = async (content: string, inputType: "voice" | "text") => {
    console.log("🎬 handleMessage called with:", content.substring(0, 50), "inputType:", inputType);
    console.log("   - isStreamingRef.current:", isStreamingRef.current);
    
    if (!content.trim() || isStreamingRef.current) {
      console.log("⚠️ Skipping - empty content or already streaming");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      inputType,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setStreamingText("");

    // Create a temporary assistant message for streaming
    const assistantMessageId = `assistant_${Date.now()}`;
    let accumulatedText = "";
    let finalResponse = "";
    let hasReceivedAcknowledgment = false;
    let hasStartedSpeaking = false;
    let speechQueue: string[] = [];

    try {
      isStreamingRef.current = true;

      console.log("🔄 Starting to stream query to backend...");
      // Stream the query to the backend
      for await (const event of streamAgentQuery(content.trim())) {
        console.log("✅ Received stream event:", JSON.stringify(event, null, 2));

        // Handle different event types
        switch (event.type) {
          case 'routing':
            // Backend is routing the query
            if (!hasReceivedAcknowledgment && event.message) {
              hasReceivedAcknowledgment = true;
              console.log("Routing:", event.message);
            }
            break;

          case 'routed':
            // Query has been routed to a specific handler
            console.log(`Routed to: ${event.intent} (confidence: ${event.confidence})`);
            break;

          case 'acknowledgment':
            if (!hasReceivedAcknowledgment && event.message) {
              hasReceivedAcknowledgment = true;
              console.log("Acknowledged:", event.message);
              
              // Speak acknowledgment immediately
              if (voiceEnabled && !hasStartedSpeaking) {
                console.log("🔊 Speaking acknowledgment:", event.message);
                hasStartedSpeaking = true;
                speakResponse(event.message);
              }
            }
            break;

          case 'waiting':
            // Speak waiting message if acknowledgment hasn't been spoken yet
            if (event.message) {
              console.log("Waiting:", event.message);
              
              if (voiceEnabled && !hasStartedSpeaking) {
                console.log("🔊 Speaking waiting message:", event.message);
                hasStartedSpeaking = true;
                speakResponse(event.message);
              }
            }
            break;

          case 'text':
            // Stream text chunks - update the UI and speak new chunks as they arrive
            console.log("📝 Text chunk received:", event.chunk?.substring(0, 50));

            // Speak only the new chunk (not the full text) to avoid repetition
            if (event.chunk && voiceEnabled) {
              console.log("🔊 Speaking new chunk:", event.chunk.substring(0, 50));
              hasStartedSpeaking = true;
              speakResponse(event.chunk);
            }

            if (event.fullText) {
              accumulatedText = event.fullText;
              setStreamingText(accumulatedText);

              // Update or create assistant message with streaming text
              setMessages((prev) => {
                const existingIndex = prev.findIndex(m => m.id === assistantMessageId);
                const streamingMessage: Message = {
                  id: assistantMessageId,
                  role: "assistant",
                  content: accumulatedText,
                  timestamp: new Date(),
                  inputType: "voice",
                };

                if (existingIndex >= 0) {
                  const updated = [...prev];
                  updated[existingIndex] = streamingMessage;
                  return updated;
                } else {
                  return [...prev, streamingMessage];
                }
              });
            }
            break;

          case 'UNKNOWN':
          case 'INVENTORY_DRAFT':
          case 'FINANCE_ANSWER':
            // Backend sent response with specific intent type
            console.log("🎯 Processing intent response:", event.type, "Message:", event.message);

            if (event.message) {
              finalResponse = event.message;
              console.log("📝 Setting finalResponse:", finalResponse);

              // Show immediately in streaming text
              setStreamingText(finalResponse);

              // Update message
              setMessages((prev) => {
                const existingIndex = prev.findIndex(m => m.id === assistantMessageId);
                const responseMessage: Message = {
                  id: assistantMessageId,
                  role: "assistant",
                  content: finalResponse,
                  timestamp: new Date(),
                  inputType: "voice",
                };

                if (existingIndex >= 0) {
                  console.log("✏️ Updating existing message");
                  const updated = [...prev];
                  updated[existingIndex] = responseMessage;
                  return updated;
                } else {
                  console.log("➕ Adding new message");
                  return [...prev, responseMessage];
                }
              });

              // Speak the response immediately for non-streamed responses
              if (voiceEnabled && !hasStartedSpeaking) {
                console.log("🔊 Starting TTS for:", finalResponse);
                hasStartedSpeaking = true;
                speakResponse(finalResponse);
              } else {
                console.log("🔇 Not speaking - voiceEnabled:", voiceEnabled, "hasStartedSpeaking:", hasStartedSpeaking);
              }
            } else {
              console.log("⚠️ No message in event");
            }
            break;

          case 'complete':
            // Stream is complete
            console.log("Stream completed");
            break;

          case 'final':
            // Final response received (alternate format)
            console.log("🎯 Processing final event");
            console.log("   - event.reply:", event.reply?.substring(0, 100));
            console.log("   - event.message:", event.message?.substring(0, 100));
            console.log("   - voiceEnabled:", voiceEnabled);
            console.log("   - hasStartedSpeaking:", hasStartedSpeaking);
            console.log("   - accumulatedText:", accumulatedText?.substring(0, 100));
            
            if (event.reply) {
              finalResponse = event.reply;
              console.log("📝 Setting finalResponse from reply:", finalResponse.substring(0, 100));
              
              // Show immediately in streaming text
              setStreamingText(finalResponse);
            } else if (event.message) {
              finalResponse = event.message;
              console.log("📝 Setting finalResponse from message:", finalResponse.substring(0, 100));
              
              // Show immediately in streaming text
              setStreamingText(finalResponse);
            }

            // Update the message with final content
            const contentToSave = finalResponse || accumulatedText;
            console.log("💾 Content to save:", contentToSave?.substring(0, 100));
            
            setMessages((prev) => {
              const existingIndex = prev.findIndex(m => m.id === assistantMessageId);
              const finalMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: contentToSave,
                timestamp: new Date(),
                inputType: "voice",
              };

              if (existingIndex >= 0) {
                console.log("✏️ Updating existing message with final response");
                const updated = [...prev];
                updated[existingIndex] = finalMessage;
                return updated;
              } else {
                console.log("➕ Adding new message with final response");
                return [...prev, finalMessage];
              }
            });

            // Only speak if we haven't started speaking yet (no acknowledgment or text chunks were spoken)
            const shouldSpeak = voiceEnabled && !hasStartedSpeaking && contentToSave;
            console.log("🔊 Should speak final?", shouldSpeak);
            console.log("   - voiceEnabled:", voiceEnabled);
            console.log("   - hasStartedSpeaking:", hasStartedSpeaking);
            console.log("   - contentToSave:", !!contentToSave);
            
            if (shouldSpeak) {
              console.log("🔊 Speaking final response (no prior speech):", contentToSave.substring(0, 100));
              hasStartedSpeaking = true;
              speakResponse(contentToSave);
            } else if (hasStartedSpeaking) {
              console.log("ℹ️ Already speaking from chunks/acknowledgment, skipping final speech");
            } else {
              console.log("🔇 Not speaking final - voiceEnabled:", voiceEnabled, "hasStartedSpeaking:", hasStartedSpeaking, "hasContent:", !!contentToSave);
            }
            break;

          case 'error':
            console.error("Stream error:", event.message);
            // Add error message
            setMessages((prev) => [...prev, {
              id: assistantMessageId,
              role: "assistant",
              content: event.message || "Sorry, I encountered an error processing your request.",
              timestamp: new Date(),
              inputType: "voice",
            }]);

            if (voiceEnabled) {
              speakResponse("Sorry, I encountered an error. Please try again.");
            }
            break;
        }
      }
    } catch (error: any) {
      console.error("Message handling error:", error);

      // Add error message
      setMessages((prev) => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please check your internet and try again.",
        timestamp: new Date(),
        inputType: "voice",
      }]);

      if (voiceEnabled) {
        speakResponse("Sorry, I'm having trouble connecting. Please try again.");
      }
    } finally {
      isStreamingRef.current = false;
      setIsProcessing(false);
      // Don't clear streaming text immediately - let it persist for UI display
      // It will be cleared when the next message starts
      setTimeout(() => {
        setStreamingText("");
      }, 500); // Small delay to ensure UI updates
    }
  };

  const speakResponse = async (text: string) => {
    console.log("🎤 speakResponse called with text:", text.substring(0, 100));
    setIsSpeaking(true);
    
    try {
      // Get all available voices
      const voices = await Speech.getAvailableVoicesAsync();
      console.log("🎤 Available voices count:", voices.length);
      
      // Find a male voice, prioritizing Indian English
      let selectedVoice = voices.find(
        (v) => v.language.includes("en-IN") && v.name.toLowerCase().includes("male")
      );
      
      // Fallback: any male English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) => v.language.includes("en") && v.name.toLowerCase().includes("male")
        );
      }
      
      // Fallback: any Indian English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.language.includes("en-IN"));
      }

      console.log("🎤 Selected voice:", selectedVoice?.name || "default");
      console.log("🎤 Starting Speech.speak...");

      Speech.speak(text, {
        language: "en-IN", // Indian English
        voice: selectedVoice?.identifier, // Use specific voice identifier if found
        pitch: 0.9, // Slightly lower pitch for more masculine tone
        rate: 0.9,
        onDone: () => {
          console.log("🎤 Speech completed");
          setIsSpeaking(false);
        },
        onStopped: () => {
          console.log("🎤 Speech stopped");
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error("🎤 Speech error:", error);
          setIsSpeaking(false);
        },
      });
      
      console.log("🎤 Speech.speak called successfully");
    } catch (error) {
      console.error("🎤 Failed to set voice:", error);
      // Fallback to default if voice selection fails
      Speech.speak(text, {
        language: "en-IN",
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sendTextMessage = (content: string) => {
    handleMessage(content, "text");
  };

  const clearHistory = async () => {
    setMessages([]);
    try {
      await AsyncStorage.removeItem(VOICE_HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear voice history:", error);
    }
  };

  const toggleVoiceEnabled = () => {
    setVoiceEnabled((prev) => !prev);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  const toggleWakeWord = () => {
    setWakeWordEnabled((prev) => !prev);
    // TODO: Implement wake word detection start/stop
  };

  return (
    <VoiceContext.Provider
      value={{
        messages,
        isListening,
        isProcessing,
        isSpeaking,
        voiceEnabled,
        wakeWordEnabled,
        toggleVoice,
        stopListening,
        sendTextMessage,
        clearHistory,
        toggleVoiceEnabled,
        toggleWakeWord,
        stopSpeaking,
        recognizedText,
        streamingText,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

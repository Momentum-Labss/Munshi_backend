import { ChatInput, MessageBubble } from "@/components/munshi";
import { useTheme } from "@/hooks/useTheme";
import { useVoice } from "@/hooks/useVoice";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MunshiScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const {
    messages,
    isListening,
    isProcessing,
    isSpeaking,
    voiceEnabled,
    wakeWordEnabled,
    toggleVoice,
    clearHistory,
    toggleVoiceEnabled,
    toggleWakeWord,
    stopSpeaking,
    sendTextMessage,
    recognizedText,
    streamingText,
  } = useVoice();

  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "hinglish">("en");

  // Get current hour for contextual suggestions
  const currentHour = new Date().getHours();

  // Calculate conversation insights
  const insights = useMemo(() => {
    const userMessages = messages.filter((m) => m.role === "user");

    // Count command types
    const commandCounts: Record<string, number> = {};
    userMessages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      if (content.includes("sale") || content.includes("sell")) {
        commandCounts["sales"] = (commandCounts["sales"] || 0) + 1;
      } else if (content.includes("stock") || content.includes("inventory")) {
        commandCounts["stock"] = (commandCounts["stock"] || 0) + 1;
      } else if (content.includes("udhaar") || content.includes("credit")) {
        commandCounts["udhaar"] = (commandCounts["udhaar"] || 0) + 1;
      } else if (content.includes("summary") || content.includes("report")) {
        commandCounts["summary"] = (commandCounts["summary"] || 0) + 1;
      }
    });

    // Find most common command
    const mostCommon = Object.entries(commandCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Time-based analytics
    const hourCounts: Record<number, number> = {};
    userMessages.forEach((msg) => {
      const hour = new Date(msg.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const busiestHour = Object.entries(hourCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalConversations: userMessages.length,
      mostCommonCommand: mostCommon?.[0],
      mostCommonCount: mostCommon?.[1] || 0,
      busiestHour: busiestHour?.[0] ? parseInt(busiestHour[0]) : null,
      busiestHourCount: busiestHour?.[1] || 0,
      commandCounts,
    };
  }, [messages]);

  // Smart contextual suggestions
  const smartSuggestions = useMemo(() => {
    const base = [
      { text: "Record a sale", icon: "cash-outline" as const, context: "anytime" },
      { text: "Check stock", icon: "cube-outline" as const, context: "anytime" },
      { text: "Add udhaar", icon: "wallet-outline" as const, context: "anytime" },
      { text: "Today's summary", icon: "bar-chart-outline" as const, context: "anytime" },
    ];

    // Morning suggestions (6 AM - 12 PM)
    if (currentHour >= 6 && currentHour < 12) {
      return [
        { text: "Good morning! Check yesterday's sales", icon: "sunny-outline" as const, context: "morning" },
        { text: "Review stock levels", icon: "cube-outline" as const, context: "morning" },
        ...base.slice(0, 2),
      ];
    }

    // Afternoon suggestions (12 PM - 6 PM)
    if (currentHour >= 12 && currentHour < 18) {
      return [
        { text: "Record a sale", icon: "cash-outline" as const, context: "afternoon" },
        { text: "Check pending udhaar", icon: "wallet-outline" as const, context: "afternoon" },
        ...base.slice(2),
      ];
    }

    // Evening suggestions (6 PM - 10 PM)
    if (currentHour >= 18 && currentHour < 22) {
      return [
        { text: "Today's summary", icon: "bar-chart-outline" as const, context: "evening" },
        { text: "Review today's sales", icon: "trending-up-outline" as const, context: "evening" },
        ...base.slice(0, 2),
      ];
    }

    // Night suggestions (10 PM - 6 AM)
    return [
      { text: "View today's report", icon: "document-text-outline" as const, context: "night" },
      { text: "Check closing balance", icon: "cash-outline" as const, context: "night" },
      ...base.slice(2),
    ];
  }, [currentHour]);

  // Language options
  const languageOptions = [
    { code: "en" as const, label: "English", nativeLabel: "English" },
    { code: "hi" as const, label: "Hindi", nativeLabel: "हिंदी" },
    { code: "hinglish" as const, label: "Hinglish", nativeLabel: "हिंग्लिश" },
  ];

  // Voice command examples by category
  const voiceCommands = [
    {
      category: "Sales",
      icon: "cash-outline" as const,
      color: "#10B981",
      examples: [
        "Record a sale of 500 rupees",
        "Add a cash sale of 250",
        "Log UPI payment of 1000",
      ],
    },
    {
      category: "Stock",
      icon: "cube-outline" as const,
      color: "#F59E0B",
      examples: [
        "Check rice stock",
        "How much oil is left?",
        "Update sugar quantity",
      ],
    },
    {
      category: "Credit (Udhaar)",
      icon: "wallet-outline" as const,
      color: "#8B5CF6",
      examples: [
        "Add udhaar for Rahul, 500 rupees",
        "Check pending credits",
        "Mark Priya's udhaar as paid",
      ],
    },
    {
      category: "Reports",
      icon: "bar-chart-outline" as const,
      color: "#3B82F6",
      examples: [
        "Show today's summary",
        "What were yesterday's sales?",
        "Show this week's report",
      ],
    },
  ];

  const handleOrbPress = () => {
    if (isSpeaking) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      stopSpeaking();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toggleVoice();
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all conversation history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            clearHistory();
            setShowHistory(false);
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      id: "sale",
      icon: "cash-outline" as const,
      label: "Sale",
      color: "#10B981",
      command: "Record a sale",
    },
    {
      id: "stock",
      icon: "cube-outline" as const,
      label: "Stock",
      color: "#F59E0B",
      command: "Check stock",
    },
    {
      id: "udhaar",
      icon: "wallet-outline" as const,
      label: "Credit",
      color: "#8B5CF6",
      command: "Add udhaar",
    },
    {
      id: "summary",
      icon: "bar-chart-outline" as const,
      label: "Summary",
      color: "#3B82F6",
      command: "Today's summary",
    },
  ];

  const getOrbState = () => {
    if (isListening) return "listening";
    if (isSpeaking) return "speaking";
    if (isProcessing) return "processing";
    return "idle";
  };

  const getStatusText = () => {
    if (isListening) return "Listening...";
    if (isProcessing) return "Thinking...";
    if (isSpeaking) return "Speaking...";
    if (wakeWordEnabled) return 'Say "Munshi" to start';
    return "Tap to speak";
  };

  const getSubtitleText = () => {
    if (isListening) return "I'm listening to your request";
    if (isSpeaking) return "Let me answer that for you";
    if (isProcessing) return "Processing your request";
    if (wakeWordEnabled) return "Wake word detection is active";

    // Contextual greetings
    if (currentHour >= 5 && currentHour < 12) return "Good morning! How can I help?";
    if (currentHour >= 12 && currentHour < 17) return "Good afternoon! Ready to assist";
    if (currentHour >= 17 && currentHour < 21) return "Good evening! What do you need?";
    return "Voice assistant for your shop";
  };

  // Wake word detection haptic feedback
  useEffect(() => {
    if (wakeWordEnabled && isListening) {
      // Special haptic pattern for wake word activation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 100);
    }
  }, [isListening, wakeWordEnabled]);

  const orbState = getOrbState();

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: isDark
          ? theme.colors.background.primary
          : theme.colors.background.secondary,
      }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5"
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSettings(true);
          }}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDark
              ? theme.colors.background.card
              : theme.colors.background.primary,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={theme.colors.text.tertiary}
          />
          {wakeWordEnabled && (
            <View
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.brand.primary }}
            />
          )}
        </TouchableOpacity>

        <Text
          style={{
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}
        >
          Munshi
        </Text>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowHelp(true);
            }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark
                ? theme.colors.background.card
                : theme.colors.background.primary,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowHistory(true);
            }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: isDark
                ? theme.colors.background.card
                : theme.colors.background.primary,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="list"
              size={20}
              color={theme.colors.text.tertiary}
            />
            {messages.length > 0 && (
              <View
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.brand.primary }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: "#fff",
                  }}
                >
                  {messages.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Clean Centered UI */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Live Transcription Text */}
        {isListening && recognizedText ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
            style={{
              position: "absolute",
              top: "15%",
              width: "100%",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              "{recognizedText}"
            </Text>
          </MotiView>
        ) : null}

        {/* Streaming Response Text */}
        {streamingText && !isListening ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
            style={{
              position: "absolute",
              top: "20%",
              width: "90%",
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: isDark
                ? theme.colors.background.card + "CC"
                : theme.colors.background.primary + "CC",
              borderRadius: 16,
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.regular,
                color: theme.colors.text.secondary,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {streamingText}
            </Text>
            {/* Streaming indicator - only show while processing */}
            {isProcessing && (
              <View className="flex-row items-center mt-2">
                <MotiView
                  from={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    type: "timing",
                    duration: 1500,
                    loop: true,
                  }}
                >
                  <View
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: theme.brand.primary }}
                  />
                </MotiView>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                  }}
                >
                  Streaming...
                </Text>
              </View>
            )}
          </MotiView>
        ) : null}

        {/* Simple Voice Button */}
        <TouchableOpacity
          onPress={handleOrbPress}
          activeOpacity={0.75}
          disabled={isProcessing}
        >
          <MotiView
            animate={{
              borderRadius: isListening
                ? 32
                : isSpeaking || isProcessing
                ? 44
                : 70,
              scale: isListening || isSpeaking ? 1.02 : 1,
            }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 150,
            }}
            style={{
              width: 140,
              height: 140,
              backgroundColor: isListening
                ? theme.colors.error
                : theme.brand.primary,
              alignItems: "center",
              justifyContent: "center",
              ...Platform.select({
                ios: {
                  shadowColor: isListening ? theme.colors.error : theme.brand.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                },
                android: {
                  elevation: 8,
                },
              }),
            }}
          >
            {isProcessing ? (
              <MotiView
                from={{ rotate: "0deg" }}
                animate={{ rotate: "360deg" }}
                transition={{
                  type: "timing",
                  duration: 1200,
                  loop: true,
                }}
              >
                <Ionicons name="sync" size={56} color="#fff" />
              </MotiView>
            ) : isSpeaking ? (
              <View className="flex-row items-center space-x-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <MotiView
                    key={i}
                    from={{ height: 24 }}
                    animate={{ height: [24, 56, 24] }}
                    transition={{
                      type: "timing",
                      duration: 700,
                      loop: true,
                      delay: i * 100,
                    }}
                    style={{
                      width: 6,
                      backgroundColor: "#fff",
                      borderRadius: 3,
                    }}
                  />
                ))}
              </View>
            ) : (
              <Ionicons
                name={isListening ? "stop" : "mic"}
                size={56}
                color="#fff"
              />
            )}
          </MotiView>
        </TouchableOpacity>

        {/* Status Text */}
        <MotiView
          animate={{
            opacity: 1,
            scale: isListening || isSpeaking ? 1.05 : 1,
          }}
          transition={{
            type: "spring",
            damping: 15,
          }}
          style={{ marginTop: 32 }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.xxl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              textAlign: "center",
            }}
          >
            {isListening
              ? "Listening..."
              : isSpeaking
              ? "Speaking..."
              : isProcessing
              ? "Processing..."
              : "Tap to speak"}
          </Text>

          {!isListening && !isSpeaking && !isProcessing && (
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text.tertiary,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              {getSubtitleText()}
            </Text>
          )}
        </MotiView>

        {/* Insights Button */}
        {messages.length > 5 && !isListening && !isProcessing && !isSpeaking && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              delay: 300,
            }}
            className="absolute bottom-8"
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowInsights(true);
              }}
              className="flex-row items-center px-5 py-3 rounded-full"
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.primary,
                borderWidth: 1,
                borderColor: isDark
                  ? theme.colors.background.input
                  : theme.colors.borderLight,
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="analytics-outline"
                size={18}
                color={theme.brand.primary}
              />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  marginLeft: 8,
                }}
              >
                View Insights
              </Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </View>

      {/* Voice Command Help Modal */}
      <Modal
        visible={showHelp}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          className="flex-1"
          style={{
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.secondary,
          }}
        >
          {/* Modal Header */}
          <View
            className="flex-row items-center justify-between px-5"
            style={{
              paddingTop: insets.top + 12,
              paddingBottom: 16,
              backgroundColor: isDark
                ? theme.colors.background.primary
                : theme.colors.background.primary,
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? theme.colors.background.input
                : theme.colors.borderLight,
            }}
          >
            <View style={{ width: 40 }} />
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
              }}
            >
              Voice Commands
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowHelp(false);
              }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.secondary,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Help Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              padding: 20,
            }}
          >
            <View
              className="p-4 rounded-2xl mb-6 flex-row"
              style={{
                backgroundColor: theme.brand.primary + "10",
              }}
            >
              <Ionicons
                name="bulb"
                size={20}
                color={theme.brand.primary}
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Speak naturally! Munshi understands casual Hindi and English commands.
              </Text>
            </View>

            {voiceCommands.map((category, index) => (
              <MotiView
                key={category.category}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "spring",
                  delay: index * 100,
                }}
                className="mb-6"
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: category.color + "15" }}
                  >
                    <Ionicons
                      name={category.icon}
                      size={20}
                      color={category.color}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {category.category}
                  </Text>
                </View>

                {category.examples.map((example, i) => (
                  <View
                    key={i}
                    className="flex-row items-start mb-2.5 pl-3"
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.brand.primary,
                        marginRight: 8,
                        marginTop: 2,
                      }}
                    >
                      •
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                        flex: 1,
                        lineHeight: 20,
                      }}
                    >
                      "{example}"
                    </Text>
                  </View>
                ))}
              </MotiView>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Insights Modal */}
      <Modal
        visible={showInsights}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          className="flex-1"
          style={{
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.secondary,
          }}
        >
          {/* Modal Header */}
          <View
            className="flex-row items-center justify-between px-5"
            style={{
              paddingTop: insets.top + 12,
              paddingBottom: 16,
              backgroundColor: isDark
                ? theme.colors.background.primary
                : theme.colors.background.primary,
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? theme.colors.background.input
                : theme.colors.borderLight,
            }}
          >
            <View style={{ width: 40 }} />
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
              }}
            >
              Conversation Insights
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowInsights(false);
              }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.secondary,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Insights Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              padding: 20,
            }}
          >
            {/* Total Conversations */}
            <View
              className="p-5 rounded-2xl mb-4"
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.primary,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.tertiary,
                  }}
                >
                  Total Conversations
                </Text>
                <Ionicons
                  name="chatbubbles"
                  size={20}
                  color={theme.brand.primary}
                />
              </View>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                }}
              >
                {insights.totalConversations}
              </Text>
            </View>

            {/* Most Common Command */}
            {insights.mostCommonCommand && (
              <View
                className="p-5 rounded-2xl mb-4"
                style={{
                  backgroundColor: isDark
                    ? theme.colors.background.card
                    : theme.colors.background.primary,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    Most Used Feature
                  </Text>
                  <Ionicons
                    name="trophy"
                    size={20}
                    color="#F59E0B"
                  />
                </View>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                    textTransform: "capitalize",
                    marginBottom: 4,
                  }}
                >
                  {insights.mostCommonCommand}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.tertiary,
                  }}
                >
                  Used {insights.mostCommonCount} times
                </Text>
              </View>
            )}

            {/* Busiest Hour */}
            {insights.busiestHour !== null && (
              <View
                className="p-5 rounded-2xl mb-4"
                style={{
                  backgroundColor: isDark
                    ? theme.colors.background.card
                    : theme.colors.background.primary,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    Busiest Time
                  </Text>
                  <Ionicons
                    name="time"
                    size={20}
                    color={theme.brand.primary}
                  />
                </View>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                    marginBottom: 4,
                  }}
                >
                  {insights.busiestHour}:00 - {insights.busiestHour + 1}:00
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.tertiary,
                  }}
                >
                  {insights.busiestHourCount} conversations in this hour
                </Text>
              </View>
            )}

            {/* Command Breakdown */}
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: 12,
              }}
            >
              Command Breakdown
            </Text>
            {Object.entries(insights.commandCounts).map(([key, count]) => (
              <View
                key={key}
                className="flex-row items-center justify-between p-4 rounded-xl mb-2"
                style={{
                  backgroundColor: isDark
                    ? theme.colors.background.card
                    : theme.colors.background.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.text.primary,
                    textTransform: "capitalize",
                  }}
                >
                  {key}
                </Text>
                <View className="flex-row items-center">
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.brand.primary,
                      marginRight: 8,
                    }}
                  >
                    {count}
                  </Text>
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: Math.min((count / insights.mostCommonCount) * 80, 80),
                      backgroundColor: theme.brand.primary + "40",
                    }}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          className="flex-1"
          style={{
            backgroundColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.secondary,
          }}
        >
          {/* Modal Header */}
          <View
            className="flex-row items-center justify-between px-5"
            style={{
              paddingTop: insets.top + 12,
              paddingBottom: 16,
              backgroundColor: isDark
                ? theme.colors.background.primary
                : theme.colors.background.primary,
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? theme.colors.background.input
                : theme.colors.borderLight,
            }}
          >
            <View style={{ width: 40 }} />
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
              }}
            >
              Voice Settings
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSettings(false);
              }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.secondary,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Settings Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              padding: 20,
            }}
          >
            {/* Language Selection */}
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.tertiary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Language
            </Text>
            <View className="mb-6">
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedLanguage(lang.code);
                  }}
                  className="flex-row items-center justify-between p-4 rounded-2xl mb-2"
                  style={{
                    backgroundColor:
                      selectedLanguage === lang.code
                        ? theme.brand.primary + "15"
                        : isDark
                        ? theme.colors.background.card
                        : theme.colors.background.primary,
                    borderWidth: selectedLanguage === lang.code ? 2 : 0,
                    borderColor: theme.brand.primary,
                  }}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text.primary,
                        marginBottom: 2,
                      }}
                    >
                      {lang.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.tertiary,
                      }}
                    >
                      {lang.nativeLabel}
                    </Text>
                  </View>
                  {selectedLanguage === lang.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.brand.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Voice Responses */}
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.tertiary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Voice Features
            </Text>
            <View
              className="p-4 rounded-2xl mb-4"
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.primary,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text.primary,
                      marginBottom: 4,
                    }}
                  >
                    Voice Responses
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    Munshi will speak responses aloud
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleVoiceEnabled();
                  }}
                  className="ml-4"
                >
                  <View
                    className="w-14 h-8 rounded-full justify-center"
                    style={{
                      backgroundColor: voiceEnabled
                        ? theme.brand.primary
                        : theme.colors.background.input,
                    }}
                  >
                    <View
                      className="w-6 h-6 rounded-full bg-white"
                      style={{
                        marginLeft: voiceEnabled ? 28 : 4,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Wake Word Detection */}
            <View
              className="p-4 rounded-2xl mb-4"
              style={{
                backgroundColor: isDark
                  ? theme.colors.background.card
                  : theme.colors.background.primary,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text.primary,
                      }}
                    >
                      Wake Word "Munshi"
                    </Text>
                    <View
                      className="ml-2 px-2 py-0.5 rounded"
                      style={{ backgroundColor: theme.brand.primary + "20" }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: theme.typography.fontWeight.bold,
                          color: theme.brand.primary,
                        }}
                      >
                        BETA
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    Always listen for "Munshi" to activate
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleWakeWord();
                  }}
                  className="ml-4"
                >
                  <View
                    className="w-14 h-8 rounded-full justify-center"
                    style={{
                      backgroundColor: wakeWordEnabled
                        ? theme.brand.primary
                        : theme.colors.background.input,
                    }}
                  >
                    <View
                      className="w-6 h-6 rounded-full bg-white"
                      style={{
                        marginLeft: wakeWordEnabled ? 28 : 4,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info Box */}
            <View
              className="p-4 rounded-2xl flex-row"
              style={{
                backgroundColor: theme.brand.primary + "10",
              }}
            >
              <Ionicons
                name="information-circle"
                size={20}
                color={theme.brand.primary}
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  flex: 1,
                }}
              >
                When wake word is enabled, Munshi continuously listens for the
                word "Munshi" to activate. This may use more battery.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <View
            className="flex-1"
            style={{
              backgroundColor: isDark
                ? theme.colors.background.primary
                : theme.colors.background.secondary,
            }}
          >
            {/* Modal Header */}
            <View
              className="flex-row items-center justify-between px-5"
              style={{
                paddingTop: insets.top + 12,
                paddingBottom: 16,
                backgroundColor: isDark
                  ? theme.colors.background.primary
                  : theme.colors.background.primary,
                borderBottomWidth: 1,
                borderBottomColor: isDark
                  ? theme.colors.background.input
                  : theme.colors.borderLight,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowHistory(false);
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? theme.colors.background.card
                    : theme.colors.background.secondary,
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                }}
              >
                Conversation History
              </Text>

              {messages.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearChat}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? theme.colors.background.card
                      : theme.colors.background.secondary,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.text.tertiary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Smart Suggestions Header */}
            {messages.length === 0 && (
              <View className="px-5 pt-4">
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.tertiary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 12,
                  }}
                >
                  Suggested for you
                </Text>
              </View>
            )}

            {/* Messages List */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: messages.length === 0 ? 8 : 16,
                paddingBottom: 16,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.length === 0 ? (
                <View>
                  {smartSuggestions.map((suggestion, index) => (
                    <MotiView
                      key={index}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 120,
                        delay: index * 60,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          sendTextMessage(suggestion.text);
                        }}
                        className="flex-row items-center mb-2.5 px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: isDark
                            ? theme.colors.background.card
                            : theme.colors.background.primary,
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                          style={{
                            backgroundColor: theme.brand.primary + "15",
                          }}
                        >
                          <Ionicons
                            name={suggestion.icon}
                            size={18}
                            color={theme.brand.primary}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.md,
                            fontWeight: theme.typography.fontWeight.medium,
                            color: theme.colors.text.primary,
                            flex: 1,
                          }}
                        >
                          {suggestion.text}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={theme.colors.text.tertiary}
                        />
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                </View>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                  />
                ))
              )}
            </ScrollView>

            {/* Text Input */}
            <ChatInput
              onSend={sendTextMessage}
              isProcessing={isProcessing || isSpeaking}
              isListening={false}
              placeholder="Type a message..."
            />

            {/* Bottom safe area */}
            <View
              style={{
                height: insets.bottom,
                backgroundColor: isDark
                  ? theme.colors.background.primary
                  : theme.colors.background.primary,
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default MunshiScreen;

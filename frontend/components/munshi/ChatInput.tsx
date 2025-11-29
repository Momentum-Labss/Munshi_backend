import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useState } from "react";
import { Platform, TextInput, TouchableOpacity, View } from "react-native";

interface ChatInputProps {
  onSend: (message: string) => void;
  onMicPress?: () => void;
  isProcessing?: boolean;
  isListening?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onMicPress,
  isProcessing = false,
  isListening = false,
  placeholder = "Type a message...",
}) => {
  const { theme, isDark } = useTheme();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isProcessing) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMicPress?.();
  };

  const hasMessage = message.trim().length > 0;

  return (
    <View
      className="px-4 py-3"
      style={{
        backgroundColor: isDark
          ? theme.colors.background.primary
          : theme.colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: isDark
          ? theme.colors.background.input
          : theme.colors.borderLight,
      }}
    >
      <View
        className="flex-row items-end rounded-2xl"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.input
            : theme.colors.background.secondary,
        }}
      >
        <TextInput
          className="flex-1 px-4 py-3"
          style={{
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.text.primary,
            maxHeight: 120,
            minHeight: 46,
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!isProcessing}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <View className="flex-row items-center pr-2 pb-2">
          {!hasMessage && onMicPress && (
            <TouchableOpacity
              onPress={handleMicPress}
              className="w-9 h-9 rounded-xl items-center justify-center mr-1"
              style={{
                backgroundColor: isListening
                  ? theme.colors.error
                  : "transparent",
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isListening ? "mic" : "mic-outline"}
                size={20}
                color={
                  isListening
                    ? "#fff"
                    : isDark
                    ? theme.colors.text.secondary
                    : theme.colors.text.tertiary
                }
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSend}
            disabled={!hasMessage || isProcessing}
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{
              backgroundColor:
                hasMessage && !isProcessing
                  ? theme.brand.primary
                  : isDark
                  ? theme.colors.background.card
                  : theme.colors.background.input,
            }}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <MotiView
                from={{ rotate: "0deg" }}
                animate={{ rotate: "360deg" }}
                transition={{
                  type: "timing",
                  duration: 1000,
                  loop: true,
                }}
              >
                <Ionicons
                  name="sync"
                  size={18}
                  color={theme.colors.text.tertiary}
                />
              </MotiView>
            ) : (
              <Ionicons
                name="arrow-up"
                size={18}
                color={hasMessage ? "#fff" : theme.colors.text.disabled}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ChatInput;

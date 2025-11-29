import { useTheme } from "@/hooks/useTheme";
import { Message } from "@/types";
import { MotiView } from "moti";
import React from "react";
import { Image, Platform, Text, View } from "react-native";

interface MessageBubbleProps {
  message: Message;
  index?: number;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index = 0,
}) => {
  const { theme, isDark } = useTheme();
  const isUser = message.role === "user";

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "spring",
        damping: 18,
        stiffness: 150,
        delay: index * 30,
      }}
      className={`mb-4 ${isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`flex-row items-end ${isUser ? "flex-row-reverse" : ""}`}
        style={{ maxWidth: "80%" }}
      >
        {!isUser && (
          <View
            className="w-7 h-7 rounded-lg items-center justify-center mr-2 overflow-hidden"
            style={{
              backgroundColor: theme.brand.primary,
            }}
          >
            <Image
              source={require("@/assets/munshi_transparent.png")}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </View>
        )}

        <View
          className="rounded-2xl px-4 py-3"
          style={{
            backgroundColor: isUser
              ? theme.brand.primary
              : isDark
              ? theme.colors.background.card
              : theme.colors.background.primary,
            borderBottomRightRadius: isUser ? 6 : 18,
            borderBottomLeftRadius: isUser ? 18 : 6,
            ...(!isUser &&
              Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.15 : 0.04,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 1,
                },
              })),
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              color: isUser ? "#fff" : theme.colors.text.primary,
            }}
          >
            {message.content}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: isUser
                ? "rgba(255,255,255,0.6)"
                : theme.colors.text.tertiary,
              marginTop: 6,
              textAlign: isUser ? "right" : "left",
            }}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </MotiView>
  );
};

export default MessageBubble;

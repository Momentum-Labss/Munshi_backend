import { useMunshi } from "@/hooks/useMunshi";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { Image, Platform, TouchableOpacity } from "react-native";

interface FloatingMunshiButtonProps {
  bottom?: number;
  right?: number;
}

export const FloatingMunshiButton: React.FC<FloatingMunshiButtonProps> = ({
  bottom = 100,
  right = 16,
}) => {
  const { theme, isDark } = useTheme();
  const { isProcessing, messages } = useMunshi();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/munshi");
  };

  const hasUnread =
    messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        damping: 12,
        stiffness: 150,
      }}
      style={{
        position: "absolute",
        bottom,
        right,
        zIndex: 1000,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: theme.brand.primary,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
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
              duration: 1000,
              loop: true,
            }}
          >
            <Ionicons name="sync" size={24} color="#fff" />
          </MotiView>
        ) : (
          <Image
            source={require("@/assets/munshi_transparent.png")}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>

      {/* Notification dot for unread messages */}
      {hasUnread && !isProcessing && (
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 200,
          }}
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: theme.colors.error,
            borderWidth: 2,
            borderColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.secondary,
          }}
        />
      )}
    </MotiView>
  );
};

export default FloatingMunshiButton;

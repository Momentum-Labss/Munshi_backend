// components/voice/GlobalVoiceWidget.tsx

import { useTheme } from "@/hooks/useTheme";
import { useVoice } from "@/hooks/useVoice";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React from "react";
import { Image, Platform, TouchableOpacity, View } from "react-native";

interface GlobalVoiceWidgetProps {
  bottom?: number;
  right?: number;
}

export const GlobalVoiceWidget: React.FC<GlobalVoiceWidgetProps> = ({
  bottom = 100,
  right = 20,
}) => {
  const { theme } = useTheme();
  const { isListening, isProcessing, isSpeaking, toggleVoice } = useVoice();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleVoice();
  };

  const isActive = isListening || isSpeaking;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 200,
      }}
      style={{
        position: "absolute",
        bottom,
        right,
        zIndex: 9999,
      }}
    >
      {/* Pulsing rings when active */}
      {isActive && (
        <>
          <MotiView
            from={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              type: "timing",
              duration: 1500,
              loop: true,
            }}
            style={{
              position: "absolute",
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.brand.primary,
              top: -4,
              left: -4,
            }}
          />
          <MotiView
            from={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{
              type: "timing",
              duration: 1500,
              loop: true,
              delay: 500,
            }}
            style={{
              position: "absolute",
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.brand.primary,
              top: -4,
              left: -4,
            }}
          />
        </>
      )}

      {/* Main button */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={isProcessing}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isActive
            ? theme.colors.error
            : theme.brand.primary,
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
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 3,
                borderColor: "#fff",
                borderTopColor: "transparent",
              }}
            />
          </MotiView>
        ) : isSpeaking ? (
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{
              type: "timing",
              duration: 600,
              loop: true,
            }}
          >
            <Image
              source={require("@/assets/munshi_transparent.png")}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </MotiView>
        ) : isListening ? (
          <MotiView
            from={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{
              type: "timing",
              duration: 500,
              loop: true,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "#fff",
              }}
            />
          </MotiView>
        ) : (
          <Image
            source={require("@/assets/munshi_transparent.png")}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

export default GlobalVoiceWidget;

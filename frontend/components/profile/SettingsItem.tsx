import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";

export interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
  index?: number;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
  index = 0,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 120,
        delay: index * 50,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.7}
        className="flex-row items-center py-4 px-4"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.card
            : theme.colors.background.primary,
        }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{
            backgroundColor: danger
              ? `${theme.colors.error}15`
              : isDark
              ? theme.colors.background.input
              : theme.colors.background.secondary,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={danger ? theme.colors.error : isDark ? theme.colors.primary : theme.brand.primary}
          />
        </View>

        <View className="flex-1">
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.medium,
              color: danger ? theme.colors.error : theme.colors.text.primary,
            }}
          >
            {label}
          </Text>
        </View>

        {value && (
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.tertiary,
              marginRight: 8,
            }}
          >
            {value}
          </Text>
        )}

        {showArrow && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.tertiary}
          />
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

export default SettingsItem;

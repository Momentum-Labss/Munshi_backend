import { MotiView } from "moti";
import React, { useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export default function Input({
  label,
  error,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  className = "",
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      <MotiView
        animate={{
          scale: isFocused ? 1.02 : 1,
          borderColor: error
            ? "#ef4444"
            : isFocused
            ? "#6366f1"
            : "#e2e8f0",
        }}
        transition={{
          type: "timing",
          duration: 200,
        }}
        style={{
          borderWidth: 2,
          borderRadius: 16,
          backgroundColor: "white",
        }}
        className="dark:bg-slate-800"
      >
        <View className="flex-row items-center px-4">
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={isFocused ? "#6366f1" : "#94a3b8"}
              style={{ marginRight: 12 }}
            />
          )}

          <TextInput
            className={`flex-1 py-4 text-base text-slate-900 dark:text-white ${className}`}
            placeholderTextColor="#94a3b8"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress}>
              <Ionicons
                name={rightIcon}
                size={20}
                color={isFocused ? "#6366f1" : "#94a3b8"}
              />
            </TouchableOpacity>
          )}
        </View>
      </MotiView>

      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 200 }}
        >
          <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
        </MotiView>
      )}
    </View>
  );
}

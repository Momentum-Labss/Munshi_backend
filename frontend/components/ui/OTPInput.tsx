import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useRef, useState, useEffect } from "react";
import { TextInput, View, Pressable } from "react-native";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
}: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    const sanitized = text.replace(/[^0-9]/g, "");

    if (sanitized.length === 0) {
      // Handle backspace
      const newValue = value.split("");
      newValue[index] = "";
      onChange(newValue.join(""));

      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (sanitized.length === 1) {
      // Handle single digit
      const newValue = value.split("");
      newValue[index] = sanitized;
      onChange(newValue.join(""));

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (sanitized.length > 1) {
      // Handle paste
      const digits = sanitized.slice(0, length).split("");
      const newValue = value.split("");

      digits.forEach((digit, i) => {
        if (index + i < length) {
          newValue[index + i] = digit;
        }
      });

      onChange(newValue.join(""));

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Focus last filled input or last input
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <View className="flex-row justify-between w-full px-4">
      {Array.from({ length }).map((_, index) => {
        const isFilled = !!value[index];
        const isFocused = focusedIndex === index;

        return (
          <Pressable
            key={index}
            onPress={() => handlePress(index)}
            className="flex-1 mx-1"
          >
            <MotiView
              animate={{
                scale: isFocused ? 1.08 : 1,
                borderColor: isFocused
                  ? "#6366f1"
                  : isFilled
                  ? "#818cf8"
                  : "#e2e8f0",
                backgroundColor: isFilled ? "#eef2ff" : "#ffffff",
              }}
              transition={{
                type: "timing",
                duration: 200,
              }}
              style={{
                borderWidth: 2,
                borderRadius: 16,
                aspectRatio: 1,
                overflow: "hidden",
              }}
              className="dark:bg-slate-800"
            >
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="flex-1 text-center text-2xl font-bold text-slate-900 dark:text-white"
                keyboardType="number-pad"
                maxLength={1}
                value={value[index] || ""}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => {
                  setFocusedIndex(index);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onBlur={() => setFocusedIndex(null)}
                selectTextOnFocus
                style={{
                  textAlignVertical: "center",
                }}
              />
            </MotiView>
          </Pressable>
        );
      })}
    </View>
  );
}

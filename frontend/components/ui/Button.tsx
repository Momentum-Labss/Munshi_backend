import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  onPress,
  className = "",
  ...props
}: ButtonProps) {
  const handlePress = async (e: any) => {
    if (!disabled && !loading) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.(e);
    }
  };

  const variantStyles = {
    primary: "bg-indigo-600 dark:bg-indigo-500",
    secondary: "bg-slate-200 dark:bg-slate-700",
    outline: "bg-transparent border-2 border-indigo-600 dark:border-indigo-400",
    ghost: "bg-transparent",
  };

  const textVariantStyles = {
    primary: "text-white",
    secondary: "text-slate-900 dark:text-slate-100",
    outline: "text-indigo-600 dark:text-indigo-400",
    ghost: "text-indigo-600 dark:text-indigo-400",
  };

  const sizeStyles = {
    sm: "py-2 px-4",
    md: "py-4 px-6",
    lg: "py-5 px-8",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <MotiView
      animate={{
        scale: disabled || loading ? 0.95 : 1,
        opacity: disabled || loading ? 0.6 : 1,
      }}
      transition={{
        type: "timing",
        duration: 200,
      }}
    >
      <TouchableOpacity
        className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-2xl flex-row items-center justify-center ${className}`}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "primary" ? "#ffffff" : "#6366f1"}
          />
        ) : (
          <>
            {leftIcon && <MotiView className="mr-2">{leftIcon}</MotiView>}
            <Text
              className={`${textVariantStyles[variant]} ${textSizeStyles[size]} font-semibold`}
            >
              {children}
            </Text>
            {rightIcon && <MotiView className="ml-2">{rightIcon}</MotiView>}
          </>
        )}
      </TouchableOpacity>
    </MotiView>
  );
}

import React from "react";
import { Text, TextProps } from "react-native";

interface LabelProps extends TextProps {
  children: React.ReactNode;
  required?: boolean;
}

export default function Label({
  children,
  required = false,
  className = "",
  ...props
}: LabelProps) {
  return (
    <Text
      className={`text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ${className}`}
      {...props}
    >
      {children}
      {required && <Text className="text-red-500 ml-1">*</Text>}
    </Text>
  );
}

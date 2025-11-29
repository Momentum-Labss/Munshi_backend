import React from "react";
import { Text } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "@/hooks/useTheme";

export interface SectionHeaderProps {
  title: string;
  delay?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  delay = 0,
}) => {
  const { theme } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 200, delay }}
      className="px-4 pt-6 pb-2"
    >
      <Text
        style={{
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
    </MotiView>
  );
};

export default SectionHeader;

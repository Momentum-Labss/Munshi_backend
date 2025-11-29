import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";

interface PaginationDotsProps {
  total: number;
  currentIndex: number;
}

export default function PaginationDots({
  total,
  currentIndex,
}: PaginationDotsProps) {
  return (
    <View className="flex-row justify-center items-center">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === currentIndex;

        return (
          <MotiView
            key={index}
            animate={{
              width: isActive ? 32 : 8,
              backgroundColor: isActive ? "#6366f1" : "#cbd5e1",
              opacity: isActive ? 1 : 0.5,
            }}
            transition={{
              type: "timing",
              duration: 300,
            }}
            style={{
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
            }}
          />
        );
      })}
    </View>
  );
}

import React from "react";
import { Image, View } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { TabBarIconProps, isImageConfig } from "./types";

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  icon,
  focused,
  color,
  size = 24,
  isCenter = false,
}) => {
  // Handle image-based icons (like Munshi)
  if (isImageConfig(icon)) {
    const imageSize = icon.size || 56;

    return (
      <MotiView
        animate={{
          scale: focused ? 1.1 : 1,
        }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 200,
        }}
        className="items-center justify-center"
      >
        <View
          className="rounded-full overflow-hidden"
          style={{
            width: imageSize,
            height: imageSize,
            shadowColor: focused ? "#1a223d" : "#000",
            shadowOffset: { width: 0, height: focused ? 4 : 2 },
            shadowOpacity: focused ? 0.3 : 0.15,
            shadowRadius: focused ? 8 : 4,
            elevation: focused ? 8 : 4,
          }}
        >
          <Image
            source={icon.source}
            style={{
              width: imageSize,
              height: imageSize,
            }}
            resizeMode="cover"
          />
        </View>
      </MotiView>
    );
  }

  // Handle icon-based tabs
  const iconName = focused && icon.focusedName ? icon.focusedName : icon.name;

  return (
    <MotiView
      animate={{
        scale: focused ? 1.15 : 1,
        translateY: focused ? -2 : 0,
      }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 200,
      }}
      className="items-center justify-center"
    >
      <Ionicons
        name={iconName}
        size={size}
        color={color}
      />

      {/* Active indicator dot */}
      <MotiView
        animate={{
          opacity: focused ? 1 : 0,
          scale: focused ? 1 : 0.5,
        }}
        transition={{
          type: "timing",
          duration: 200,
        }}
        className="absolute -bottom-2"
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
    </MotiView>
  );
};

export default TabBarIcon;

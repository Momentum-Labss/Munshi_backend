import React from "react";
import { View, TouchableOpacity, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { TabBarIcon } from "./TabBarIcon";
import { CustomTabBarProps, TabBarItemProps } from "./types";

// Individual tab item component
const TabBarItem: React.FC<TabBarItemProps> = ({
  focused,
  onPress,
  onLongPress,
  label,
  icon,
  showLabel = true,
  isCenter = false,
}) => {
  const { theme, isDark } = useTheme();

  const activeColor = isDark ? theme.colors.primary : theme.brand.primary;
  const inactiveColor = theme.colors.text.tertiary;
  const color = focused ? activeColor : inactiveColor;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress();
  };

  // Center button (Munshi) styling
  if (isCenter) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        className="flex-1 items-center justify-center"
        style={{ marginTop: -20 }}
      >
        <TabBarIcon
          icon={icon}
          focused={focused}
          color={color}
          isCenter={true}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      className="flex-1 items-center justify-center py-2"
    >
      <TabBarIcon
        icon={icon}
        focused={focused}
        color={color}
        size={24}
      />

      {showLabel && (
        <MotiView
          animate={{
            opacity: focused ? 1 : 0.7,
            translateY: focused ? 0 : 2,
          }}
          transition={{
            type: "timing",
            duration: 150,
          }}
        >
          <Text
            style={{
              color,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: focused
                ? theme.typography.fontWeight.semibold
                : theme.typography.fontWeight.regular,
              marginTop: 4,
            }}
          >
            {label}
          </Text>
        </MotiView>
      )}
    </TouchableOpacity>
  );
};

// Main TabBar component
export const TabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  tabs,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const backgroundColor = isDark
    ? theme.colors.background.card
    : theme.colors.background.primary;

  const borderColor = isDark
    ? theme.colors.border
    : theme.colors.borderLight;

  return (
    <MotiView
      from={{ translateY: 100 }}
      animate={{ translateY: 0 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 150,
      }}
      style={[
        {
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.3 : 0.08,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
          }),
        },
      ]}
    >
      <View className="flex-row items-center">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const tabConfig = tabs.find((tab) => tab.name === route.name);

          if (!tabConfig) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabBarItem
              key={route.key}
              route={route}
              index={index}
              focused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              label={tabConfig.label}
              icon={tabConfig.icon}
              showLabel={tabConfig.showLabel !== false}
              isCenter={tabConfig.isCenter}
            />
          );
        })}
      </View>
    </MotiView>
  );
};

export default TabBar;

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";

interface HeaderIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  delay?: number;
  badge?: number;
}

const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  icon,
  onPress,
  delay = 0,
  badge,
}) => {
  const { theme, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: isPressed ? 0.9 : 1,
      }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 200,
        delay: isPressed ? 0 : delay,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark
            ? theme.colors.background.elevated
            : theme.colors.background.primary,
          borderWidth: 1,
          borderColor: isDark
            ? theme.colors.border
            : theme.colors.borderLight,
          ...Platform.select({
            ios: {
              shadowColor: isDark ? "#000" : "#1a223d",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 3,
            },
          }),
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDark ? theme.colors.text.secondary : theme.colors.text.primary}
        />

        {badge !== undefined && badge > 0 && (
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 200,
              delay: delay + 300,
            }}
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              backgroundColor: theme.colors.error,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 5,
              borderWidth: 2,
              borderColor: isDark
                ? theme.colors.background.primary
                : theme.colors.background.primary,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              {badge > 99 ? "99+" : badge}
            </Text>
          </MotiView>
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

// User avatar with initials
interface UserAvatarProps {
  name: string;
  onPress?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, onPress }) => {
  const { theme, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: 1,
          scale: isPressed ? 0.95 : 1
        }}
        transition={{
          type: "spring",
          damping: 12,
          stiffness: 150,
        }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? theme.colors.primary : theme.brand.primary,
          marginRight: 12,
          ...Platform.select({
            ios: {
              shadowColor: isDark ? theme.colors.primary : theme.brand.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 4,
            },
          }),
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
        >
          {getInitials(name)}
        </Text>
      </MotiView>
    </TouchableOpacity>
  );
};

interface HomeHeaderProps {
  userName?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = "User",
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: isDark
          ? theme.colors.background.primary
          : theme.colors.background.primary,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left - Avatar and greeting */}
        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.7}
          className="flex-row items-center flex-1"
        >
          <UserAvatar name={userName} onPress={onProfilePress} />

          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 120,
              delay: 100,
            }}
            className="flex-1"
          >
            <View className="flex-row items-center">
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.tertiary,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                {getGreeting()}
              </Text>
              <MotiView
                from={{ rotate: "0deg" }}
                animate={{ rotate: "20deg" }}
                transition={{
                  type: "timing",
                  duration: 300,
                  delay: 500,
                  loop: false,
                }}
                style={{ marginLeft: 4 }}
              >
                <Text style={{ fontSize: 14 }}>👋</Text>
              </MotiView>
            </View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xxl,
                color: theme.colors.text.primary,
                fontWeight: theme.typography.fontWeight.bold,
                marginTop: 2,
                letterSpacing: -0.5,
              }}
              numberOfLines={1}
            >
              {userName}
            </Text>
          </MotiView>
        </TouchableOpacity>

        {/* Right - Action icons */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <HeaderIconButton
            icon="notifications-outline"
            onPress={onNotificationPress}
            delay={200}
            badge={notificationCount}
          />
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;

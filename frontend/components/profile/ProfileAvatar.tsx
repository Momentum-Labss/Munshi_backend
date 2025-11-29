import React from "react";
import { View, Text, TouchableOpacity, Platform, Image } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export interface ProfileAvatarProps {
  name: string;
  phone?: string;
  avatarUri?: string | null;
  onPress?: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  phone,
  avatarUri,
  onPress,
}) => {
  const { theme, isDark } = useTheme();

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 120,
      }}
      className="items-center pt-8 pb-6"
    >
      {/* Avatar */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="relative"
      >
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 150,
          }}
          className="w-28 h-28 rounded-full items-center justify-center overflow-hidden"
          style={{
            backgroundColor: isDark
              ? theme.colors.primary
              : theme.brand.primary,
            ...Platform.select({
              ios: {
                shadowColor: isDark
                  ? theme.colors.primary
                  : theme.brand.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
              },
              android: {
                elevation: 8,
              },
            }),
          }}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text
              style={{
                fontSize: 36,
                fontWeight: "700",
                color: "#FFFFFF",
                letterSpacing: 1,
              }}
            >
              {getInitials(name)}
            </Text>
          )}
        </MotiView>

        {/* Edit badge */}
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 200,
            delay: 300,
          }}
          className="absolute bottom-0 right-0 w-9 h-9 rounded-full items-center justify-center border-4"
          style={{
            backgroundColor: isDark
              ? theme.colors.background.elevated
              : theme.colors.background.primary,
            borderColor: isDark
              ? theme.colors.background.primary
              : theme.colors.background.secondary,
          }}
        >
          <Ionicons
            name="camera"
            size={16}
            color={isDark ? theme.colors.primary : theme.brand.primary}
          />
        </MotiView>
      </TouchableOpacity>

      {/* Name and Phone */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 120,
          delay: 100,
        }}
        className="mt-4"
      >
        <Text
          style={{
            fontSize: theme.typography.fontSize.xxl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            textAlign: "center",
          }}
        >
          {name}
        </Text>
        {phone && (
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.tertiary,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {phone}
          </Text>
        )}
      </MotiView>
    </MotiView>
  );
};

export default ProfileAvatar;

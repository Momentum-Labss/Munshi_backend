import { useTheme } from "@/hooks/useTheme";
import { Language, LanguageOption, UserProfile } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import ProfileAvatar from "./ProfileAvatar";
import SectionHeader from "./SectionHeader";
import SettingsItem from "./SettingsItem";

const USER_DETAILS_KEY = "@app_user_details";
const USER_AVATAR_KEY = "@app_user_avatar";

// Available languages
const languages: LanguageOption[] = [
  { name: "English", nativeName: "English" },
  { name: "Hindi", nativeName: "हिंदी" },
  { name: "Hinglish", nativeName: "हिंग्लिश" },
];

interface ProfileContentProps {
  /** Callback when modal needs to be closed (for modal usage) */
  onClose?: () => void;
  /** Bottom padding to apply */
  paddingBottom?: number;
  /** Top padding to apply */
  paddingTop?: number;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  onClose,
  paddingBottom = 24,
  paddingTop = 0,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [profileData, avatarData] = await Promise.all([
        AsyncStorage.getItem(USER_DETAILS_KEY),
        AsyncStorage.getItem(USER_AVATAR_KEY),
      ]);

      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      if (avatarData) {
        setAvatarUri(avatarData);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await AsyncStorage.setItem(USER_AVATAR_KEY, uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getLanguageName = (name: Language) => {
    const lang = languages.find((l) => l.name === name);
    return lang ? lang.nativeName : "English";
  };

  const handleChangeLanguage = () => {
    Alert.alert(
      "Select App Language",
      "Choose your preferred language",
      languages.map((lang) => ({
        text: `${lang.nativeName} (${lang.name})`,
        onPress: async () => {
          if (userProfile) {
            const updatedProfile = { ...userProfile, language: lang.name };
            setUserProfile(updatedProfile);
            await AsyncStorage.setItem(
              USER_DETAILS_KEY,
              JSON.stringify(updatedProfile)
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      })),
      { cancelable: true }
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([USER_DETAILS_KEY, USER_AVATAR_KEY]);
          await SecureStore.deleteItemAsync("authToken");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onClose?.();
          router.replace("/(auth)/onboarding");
        },
      },
    ]);
  };

  const handleNavigation = (path: string) => {
    onClose?.();
    router.push(path as any);
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <ProfileAvatar
        name={userProfile?.name || "User"}
        phone={userProfile?.number || "No phone number"}
        avatarUri={avatarUri}
        onPress={pickImage}
      />

      {/* Account Section */}
      <SectionHeader title="Account" delay={150} />
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 100,
          delay: 200,
        }}
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.card
            : theme.colors.background.primary,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
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
        <SettingsItem
          icon="person-outline"
          label="Edit Profile"
          onPress={() => handleNavigation("/profile/edit")}
          index={0}
        />
      </MotiView>

      {/* Preferences Section */}
      <SectionHeader title="Preferences" delay={250} />
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 100,
          delay: 300,
        }}
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.card
            : theme.colors.background.primary,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
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
        <SettingsItem
          icon="language-outline"
          label="App Language"
          value={getLanguageName(userProfile?.preferedLanguage || "English")}
          onPress={handleChangeLanguage}
          index={0}
        />
        <View
          className="mx-4"
          style={{ height: 1, backgroundColor: theme.colors.borderLight }}
        />
        <SettingsItem
          icon={isDark ? "moon-outline" : "sunny-outline"}
          label="Dark Mode"
          value={isDark ? "On" : "Off"}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleTheme();
          }}
          index={1}
        />
        <View
          className="mx-4"
          style={{ height: 1, backgroundColor: theme.colors.borderLight }}
        />
        <SettingsItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => handleNavigation("/notifications")}
          index={2}
        />
      </MotiView>

      {/* Support Section */}
      <SectionHeader title="Support" delay={350} />
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 100,
          delay: 400,
        }}
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.card
            : theme.colors.background.primary,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
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
        <SettingsItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => handleNavigation("/help")}
          index={0}
        />
        <View
          className="mx-4"
          style={{ height: 1, backgroundColor: theme.colors.borderLight }}
        />
        <SettingsItem
          icon="document-text-outline"
          label="Terms & Privacy"
          onPress={() => handleNavigation("/terms")}
          index={1}
        />
        <View
          className="mx-4"
          style={{ height: 1, backgroundColor: theme.colors.borderLight }}
        />
        <SettingsItem
          icon="star-outline"
          label="Rate App"
          onPress={() => Alert.alert("Rate", "Rating coming soon!")}
          index={2}
        />
      </MotiView>

      {/* Sign Out */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 100,
          delay: 450,
        }}
        className="mx-4 mt-6 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark
            ? theme.colors.background.card
            : theme.colors.background.primary,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
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
        <SettingsItem
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleSignOut}
          showArrow={false}
          danger
          index={0}
        />
      </MotiView>

      {/* Version */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 300, delay: 500 }}
        className="items-center mt-8"
      >
        <Text
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.tertiary,
          }}
        >
          Munshi v1.0.0
        </Text>
      </MotiView>
    </ScrollView>
  );
};

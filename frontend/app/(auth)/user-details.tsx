import { Button, Input } from "@/components/ui";
import { apiRequest } from "@/hooks/useRequest";
import { useTheme } from "@/hooks/useTheme";
import { Language, LanguageOption, UserProfile } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Available languages
const languages: LanguageOption[] = [
  { name: "English", nativeName: "English" },
  { name: "Hindi", nativeName: "हिंदी" },
  { name: "Hinglish", nativeName: "हिंग्लिश" },
];

// Language selector component
interface LanguageSelectorProps {
  selected: Language;
  onSelect: (language: Language) => void;
}
const USER_DETAILS_KEY = "@app_user_details";

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View className="mb-4">
      <Text
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.secondary,
          marginBottom: 8,
        }}
      >
        Preferred Language
      </Text>

      <View className="flex-row" style={{ gap: 12 }}>
        {languages.map((lang, index) => {
          const isSelected = selected === lang.name;

          return (
            <MotiView
              key={lang.name}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 150,
                delay: index * 100,
              }}
              className="flex-1"
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(lang.name as Language);
                }}
                activeOpacity={0.7}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 2,
                  borderColor: isSelected
                    ? isDark
                      ? theme.colors.primary
                      : theme.brand.primary
                    : isDark
                    ? theme.colors.border
                    : theme.colors.borderLight,
                  backgroundColor: isSelected
                    ? isDark
                      ? `${theme.colors.primary}15`
                      : `${theme.brand.primary}10`
                    : isDark
                    ? theme.colors.background.card
                    : theme.colors.background.primary,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: isSelected
                      ? isDark
                        ? theme.colors.primary
                        : theme.brand.primary
                      : theme.colors.text.primary,
                  }}
                >
                  {lang.nativeName}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                    marginTop: 4,
                  }}
                >
                  {lang.name}
                </Text>

                {isSelected && (
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 12,
                      stiffness: 200,
                    }}
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: isDark
                        ? theme.colors.primary
                        : theme.brand.primary,
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </MotiView>
                )}
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
};

export default function UserDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);

    try {
      const userDetails: UserProfile = {
        name: name.trim(),
        number: phone.trim(),
        address: address.trim(),
        preferedLanguage: language,
      };

      const res = await apiRequest("post", "profile", userDetails);
      await AsyncStorage.setItem(USER_DETAILS_KEY, JSON.stringify(userDetails));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/munshi");
      return res;
    } catch (error) {
      console.error("Failed to save user details:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{
        backgroundColor: isDark
          ? theme.colors.background.primary
          : theme.colors.background.primary,
      }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 120,
          }}
          className="mb-8"
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.xxxl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: 8,
            }}
          >
            Welcome!
          </Text>
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              color: theme.colors.text.secondary,
              lineHeight: 24,
            }}
          >
            Let's set up your profile to get started with Munshi
          </Text>
        </MotiView>

        {/* Form */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 120,
            delay: 100,
          }}
        >
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            leftIcon="person-outline"
            autoCapitalize="words"
            required
          />

          <Input
            label="Phone Number"
            placeholder="Enter 10-digit number"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            leftIcon="call-outline"
            keyboardType="phone-pad"
            maxLength={10}
            required
          />

          <Input
            label="Address"
            placeholder="Enter your shop/business address"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            leftIcon="location-outline"
            multiline
            numberOfLines={3}
            required
          />

          <LanguageSelector selected={language} onSelect={setLanguage} />
        </MotiView>

        {/* Continue Button */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 120,
            delay: 200,
          }}
          className="mt-6"
        >
          <Button
            onPress={handleContinue}
            size="lg"
            loading={isLoading}
            rightIcon={
              <Ionicons name="arrow-forward" size={20} color="white" />
            }
          >
            Continue
          </Button>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

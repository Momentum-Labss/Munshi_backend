import { useTheme } from "@/hooks/useTheme";
import { UserProfile } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile, useUpdateProfile } from "@/api/profile";

import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

const USER_DETAILS_KEY = "@app_user_details";
const USER_AVATAR_KEY = "@app_user_avatar";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">(
    "English"
  );
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Fetch profile from API
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Populate form when API data is available
  useEffect(() => {
    if (profileData?.data) {
      setName(profileData.data.name || "");
      setNumber(profileData.data.phone || "");
      setAddress(profileData.data.address || "");
      if (profileData.data.preferredLanguage) {
        setLanguage(profileData.data.preferredLanguage as "English" | "Hindi" | "Hinglish");
      }
    }
  }, [profileData]);

  const loadUserProfile = async () => {
    try {
      const [jsonValue, avatarValue] = await Promise.all([
        AsyncStorage.getItem(USER_DETAILS_KEY),
        AsyncStorage.getItem(USER_AVATAR_KEY),
      ]);

      if (jsonValue != null) {
        const profile: UserProfile = JSON.parse(jsonValue);
        setName(profile.name);
        setNumber(profile.number);
        setAddress(profile.address);
        setLanguage(profile.preferedLanguage);
      }
      if (avatarValue) {
        setAvatarUri(avatarValue);
      }
    } catch (e) {
      console.error("Failed to load user profile", e);
    } finally {
      setIsLoading(false);
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
      // We'll save the avatar immediately or when saving the profile.
      // Saving immediately is better for UX as it persists even if they cancel text edits.
      // But to be consistent with "Save" button, maybe we should wait?
      // Actually, standard pattern often saves avatar immediately. Let's do that.
      try {
        await AsyncStorage.setItem(USER_AVATAR_KEY, uri);
      } catch (e) {
        console.error("Failed to save avatar", e);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !number.trim() || !address.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Get user ID from profile data
    const userId = profileData?.data?.id;
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please try logging in again.");
      return;
    }

    try {
      // Call API to update profile
      await updateProfileMutation.mutateAsync({
        userId,
        data: {
          name: name.trim(),
          phone: number.trim(),
          address: address.trim(),
          preferredLanguage: language,
        },
      });

      // Also save to local storage for offline access
      const updatedProfile: UserProfile = {
        name: name.trim(),
        number: number.trim(),
        address: address.trim(),
        preferedLanguage: language,
      };
      await AsyncStorage.setItem(
        USER_DETAILS_KEY,
        JSON.stringify(updatedProfile)
      );

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error("Failed to save user profile", e);
      const errorMessage = e?.response?.data?.message || "Failed to save profile. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    style,
    ...props
  }: any) => (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: theme.colors.text.secondary,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        keyboardType={keyboardType}
        style={[
          {
            backgroundColor: theme.colors.background.secondary,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: theme.colors.text.primary,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: theme.colors.text.primary,
          }}
        >
          Edit Profile
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={{ padding: 8 }}
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.brand.primary} />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.brand.primary,
              }}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoadingProfile ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.brand.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Avatar Placeholder */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <TouchableOpacity onPress={pickImage}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.brand.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  overflow: "hidden",
                }}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: theme.brand.primary,
                    }}
                  >
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.brand.primary,
                }}
              >
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          <InputField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <InputField
            label="Phone Number"
            value={number}
            onChangeText={setNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          <InputField
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your shop/business address"
            multiline
            numberOfLines={3}
            style={{ height: 100, textAlignVertical: "top" }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

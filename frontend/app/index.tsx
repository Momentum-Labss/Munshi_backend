// app/index.tsx - Entry point with onboarding check

import { apiRequest } from "@/hooks/useRequest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { View } from "react-native";

const ONBOARDING_KEY = "@app_onboarding_completed";

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      // Run checks in parallel for faster loading
      const [onboardingComplete, token] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        SecureStore.getItemAsync("authToken"),
      ]);

      // Small delay to ensure smooth transition from splash
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!onboardingComplete) {
        // First time user → Show onboarding
        router.replace("/(auth)/onboarding");
      } else if (token) {
        try {
          const res = await apiRequest("get", "profile");
          router.replace("/(tabs)/munshi");
          return res;
        } catch (error) {
          router.replace("/user-details");
        }
        // Returning user with auth → Go to tabs (home)
      } else {
        // Returning user without auth → Go to email
        router.replace("/(auth)/email");
      }
    } catch (error) {
      console.error("Error checking app status:", error);
      // On error, default to onboarding
      router.replace("/(auth)/onboarding");
    } finally {
      setIsChecking(false);
    }
  };

  // Show minimal loading state while checking (inherits splash background)
  if (isChecking) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1a223d]">
        {/* Subtle loading animation */}
        <MotiView
          from={{ opacity: 0.4, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            repeatReverse: true,
          }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#6366f1",
          }}
        />
      </View>
    );
  }

  return null;
}

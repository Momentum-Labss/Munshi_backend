import { apiRequest } from "@/hooks/useRequest";
import { UserProfile } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../../components/ui/Button";
import OTPInput from "../../../components/ui/OTPInput";

const USER_DETAILS_KEY = "@app_user_details";

const VerifyOtp = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const tempId = params.tempId as string;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verifyOTP = useMutation({
    mutationFn: async () => await handleVerifyOTP(),
    mutationKey: ["verify_otp"],
    onError: (error) => {
      setLoading(false);
      setError(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSuccess: async (res) => {
      setLoading(false);
      await SecureStore.setItemAsync("authToken", res.token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check if user profile exists
      try {
        const userDetails: UserProfile = await apiRequest("get", "profile");

        const user: UserProfile = {
          name: userDetails.name,
          number: userDetails.number,
          address: userDetails.address,
          preferedLanguage: userDetails.preferedLanguage,
        };

        await AsyncStorage.setItem(
          USER_DETAILS_KEY,
          JSON.stringify(userDetails)
        );

        if (userDetails) {
          // User already has profile, go to home
          router.replace("/(tabs)/home");
        } else {
          // New user, need to fill details
          router.replace("/(auth)/user-details");
        }
      } catch (error: any) {
        console.log("Profile check error:", error.message);
        // If error checking, assume new user
        router.replace("/(auth)/user-details");
      }
    },
  });

  const handleVerifyOTP = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error("Please enter the complete 6-digit code");
    }

    setLoading(true);
    const data = {
      tempId,
      otp,
    };
    const res = await apiRequest("post", "auth/signup/verify", data);
    return res;
  };

  const handleResendOTP = async () => {
    setResending(true);
    setOtp("");
    setError("");

    // Simulate API call
    setTimeout(() => {
      setResending(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleOTPComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 400 }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-slate-900"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-safe pb-8">
            {/* Decorative Background Elements */}
            <View
              key="bg-blob-1"
              className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-100 opacity-20 dark:bg-indigo-400/10 translate-x-32 -translate-y-32"
            />
            <View
              key="bg-blob-2"
              className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-100 opacity-20 dark:bg-purple-400/10 -translate-x-32 translate-y-32"
            />

            {/* Back Button */}
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", duration: 400 }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-4 mb-8 flex-row items-center"
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#6366f1"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  Back
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Header */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600 }}
              className="mb-8"
            >
              <Text className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Verify Your Email
              </Text>
              <Text className="text-base text-slate-600 dark:text-slate-400">
                We've sent a 6-digit code to
              </Text>
              <Text className="text-base text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                {email || "your email"}
              </Text>
            </MotiView>

            {/* Illustration */}
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "timing",
                duration: 800,
                delay: 200,
              }}
              className="items-center mb-12"
            >
              <MotiView
                from={{ translateY: 0, rotate: "0deg" }}
                animate={{ translateY: -10, rotate: "5deg" }}
                transition={{
                  type: "timing",
                  duration: 2000,
                  loop: true,
                  repeatReverse: true,
                }}
              >
                <View
                  className="bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-8"
                  style={{
                    shadowColor: "#6366f1",
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 10 },
                  }}
                >
                  <Image
                    source={require("../../../assets/otp.png")}
                    className="h-40 w-40"
                    resizeMode="contain"
                  />
                </View>
              </MotiView>
            </MotiView>

            {/* OTP Input */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 600,
                delay: 400,
              }}
            >
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">
                Enter Verification Code
              </Text>

              <OTPInput
                length={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError("");
                }}
                onComplete={handleOTPComplete}
              />

              {error && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 200 }}
                  className="mt-4"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color="#ef4444"
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-red-500 text-sm">{error}</Text>
                  </View>
                </MotiView>
              )}

              <Button
                onPress={() => verifyOTP.mutate()}
                loading={loading}
                size="lg"
                className="mt-8"
                rightIcon={
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                }
              >
                Verify Code
              </Button>
            </MotiView>

            {/* Resend Code */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 600,
                delay: 600,
              }}
              className="mt-6"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-sm text-slate-600 dark:text-slate-400">
                  Didn't receive the code?{" "}
                </Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={resending}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                    {resending ? "Sending..." : "Resend"}
                  </Text>
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Footer Info */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 600,
                delay: 800,
              }}
              className="mt-auto pt-8"
            >
              <View className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#6366f1"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <Text className="flex-1 text-sm text-slate-600 dark:text-slate-400">
                    For security, this code will expire in 10 minutes. If you
                    didn't request this code, please ignore this message.
                  </Text>
                </View>
              </View>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MotiView>
  );
};

export default VerifyOtp;

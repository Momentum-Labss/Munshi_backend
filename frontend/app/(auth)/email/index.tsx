import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { apiRequest } from "@/hooks/useRequest";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const EmailScreen = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const requestOTP = useMutation({
    mutationFn: async () => await handleRequestOTP(),
    mutationKey: ["request_otp"],
    onError: (error) => {
      setLoading(false);
      setError(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSuccess: (res) => {
      console.log("temp id", res);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email, tempId: res?.tempId },
      });
    },
  });

  const handleRequestOTP = async () => {
    setError("");

    if (!email) {
      setError("Email is required");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error("Email is required");
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error("Please enter a valid email address");
    }

    setLoading(true);
    const data = {
      email: email,
    };

    try {
      const res = await apiRequest("post", "auth/signup", data);
      return res;
    } catch (error: any) {
      console.log("Signup error:", error.message);
      // If user already exists (400), try signin instead
      if (error.message.includes("Invalid request") || error.message.includes("already exists")) {
        try {
          const res = await apiRequest("post", "auth/signin", data);
          return res;
        } catch (signinError: any) {
          console.log("Signin error:", signinError.message);
          throw signinError;
        }
      } else {
        throw error;
      }
    }
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
              className="absolute top-0 left-0 w-96 h-96 rounded-full bg-indigo-100 opacity-20 dark:bg-indigo-400/10 -translate-x-32 -translate-y-32"
            />
            <View
              key="bg-blob-2"
              className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-100 opacity-20 dark:bg-purple-400/10 translate-x-32 translate-y-32"
            />

            {/* Header */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600 }}
              className="mt-12 mb-8"
            >
              <Text className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back
              </Text>
              <Text className="text-base text-slate-600 dark:text-slate-400">
                Enter your email to receive a verification code
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
                from={{ translateY: 0 }}
                animate={{ translateY: -12 }}
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
                    source={require("../../../assets/email.png")}
                    className="h-48 w-48"
                    resizeMode="contain"
                  />
                </View>
              </MotiView>
            </MotiView>

            {/* Email Input Form */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 600,
                delay: 400,
              }}
            >
              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="mail-outline"
                required
              />

              <Button
                onPress={() => requestOTP.mutate()}
                loading={loading}
                size="lg"
                className="mt-4"
                rightIcon={
                  <Ionicons name="arrow-forward" size={20} color="white" />
                }
              >
                Request OTP
              </Button>
            </MotiView>

            {/* Footer Info */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 600,
                delay: 600,
              }}
              className="mt-auto pt-8"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color="#6366f1"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Your data is secure and encrypted
                </Text>
              </View>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MotiView>
  );
};

export default EmailScreen;
